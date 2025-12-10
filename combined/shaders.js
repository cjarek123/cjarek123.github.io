const vsSource = `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`

const fsSource = `#version 300 es
    precision highp float;

    // time for animation
    uniform float u_time;

    // resolution
    uniform vec2 u_resolution;

    // camera
    uniform vec3 u_cameraOrigin;
    uniform vec3 u_cameraForward;
    uniform vec3 u_cameraUp;
    uniform vec3 u_cameraRight;

    // lighting
    uniform vec3 u_lightCenter;
    uniform int u_maxBounces;
    uniform float u_ambientStrength;
    uniform float u_lightStrength;

    // Struct for general primitive
    struct Primitive {
        mat4 worldMatrix;
        vec3 color;
        float reflectivity;
        float refractiveIndex;
        int material;
        int shapeType;
        int pad0;//padding
        float field1;
        float field2;
        float field3;
        int pad1;//padding
    };

    layout(std140) uniform PrimitiveBlock {
        Primitive primitives[50];
        int primitiveCount;
    };

    // output pixel color
    out vec4 fragColor;

    // Material types
    const int MATERIAL_DIFFUSE = 0;
    const int MATERIAL_REFLECTIVE = 1;
    const int MATERIAL_REFRACTIVE = 2;

    // Primitve types
    const int PRIMITIVE_CONE = 0;
    const int PRIMITIVE_CYLINDER = 1;
    const int PRIMITIVE_ELLIPSOID = 2;
    const int PRIMITIVE_RECTPRISM = 3;
    const int PRIMITIVE_TORUS = 4;

    // Ray structure
    struct Ray {
        vec3 origin;
        vec3 direction;
    };

    // Plane structure
    struct Plane {
        vec3 normal;
        float offset;
    };

    // Hit record structure
    struct HitData {
        bool hit;
        float t;
        vec3 point;
        vec3 normal;
        vec3 color;
        int material;
        float reflectivity;
        float refractiveIndex;
        bool frontFace;
    };

    // Light Sphere
    Primitive lightSphere;

    // Initialize scene objects (light sphere)
    void initLightSphere() {
        // initialize the light sphere
        mat4 worldMatrix = mat4(1.0);
        worldMatrix[3][0] = u_lightCenter.x;
        worldMatrix[3][1] = u_lightCenter.y;
        worldMatrix[3][2] = u_lightCenter.z;
        lightSphere.worldMatrix = worldMatrix;
        lightSphere.color = vec3(1.0, 1.0, 1.0)  * (u_lightStrength / 3.0);
        lightSphere.reflectivity = 0.0;
        lightSphere.refractiveIndex = 0.0;
        lightSphere.material = MATERIAL_DIFFUSE;
        lightSphere.shapeType = 2; // ellipsoid
        lightSphere.pad0 = 0;
        lightSphere.field1 = 0.1; // rx
        lightSphere.field2 = 0.1; // ry
        lightSphere.field3 = 0.1; // rz
        lightSphere.pad1 = 0;
    }

    /**
     * 0 - Cone Intersection Check
     */
    bool intersectCone(Ray ray, mat4 worldMatrix, float r, float h, out float t, out vec3 normal) {
        
        // Transform ray into local space
        mat4 invM = inverse(worldMatrix);
        vec3 O  = (invM * vec4(ray.origin,    1.0)).xyz;
        vec3 D0 = (invM * vec4(ray.direction, 0.0)).xyz;

        float scale = length(D0);
        if (scale < 1e-8) { t = 1e30; return false; }

        vec3 D = D0 / scale;

        float k = r / h;
        float k2 = k * k;

        // shift z so apex is at z=0
        float ox = O.x;
        float oy = O.y;
        float oz = O.z - h;

        float dx = D.x;
        float dy = D.y;
        float dz = D.z;

        // quadratic coefficients for infinite cone
        float a = dx*dx + dy*dy - k2 * dz*dz;
        float b = 2.0 * (ox*dx + oy*dy - k2 * oz*dz);
        float c = ox*ox + oy*oy - k2 * oz*oz;

        float tHit = 1e30;
        vec3  nHit = vec3(0);

        // body intersection
        float disc = b*b - 4.0*a*c;
        if (disc >= 0.0) {
            float s = sqrt(disc);
            float t0 = (-b - s) / (2.0*a);
            float t1 = (-b + s) / (2.0*a);

            for (int i = 0; i < 2; i++) {
                float ti = (i == 0 ? t0 : t1);
                if (ti > 1e-4) {
                    vec3 p = O + D * ti;

                    // Valid z range: 0 ≤ z ≤ h
                    if (p.z >= 0.0 && p.z <= h) {
                        if (ti < tHit) {
                            tHit = ti;

                            // Gradient of x^2 + y^2 – k^2 (h – z)^2 = 0
                            float zz = p.z - h;
                            vec3 grad = vec3(
                                p.x,
                                p.y,
                                -k2 * zz
                            );

                            nHit = normalize(grad);
                        }
                    }
                }
            }
        }

        // base disk at z = 0
        if (abs(D.z) > 1e-6) {
            float tPlane = (0.0 - O.z) / D.z;
            if (tPlane > 1e-4) {
                vec3 p = O + D * tPlane;

                if (p.x*p.x + p.y*p.y <= r*r && tPlane < tHit) {
                    tHit = tPlane;
                    nHit = vec3(0,0,-1);  // outward (downward) normal
                }
            }
        }

        // no hit
        if (tHit == 1e30) return false;

        // transform t and normal back to world
        t = tHit * scale;

        vec3 nW = normalize((transpose(invM) * vec4(nHit, 0.0)).xyz);
        normal = nW;

        return true;
    }


    /**
     * 1 - Cylinder Intersection Check
     */
    bool intersectCylinder(Ray ray, mat4 worldMatrix, float cylinder_radius, float cylinder_height, out float t, out vec3 normal) {

        mat4 M = worldMatrix;
        mat4 invM = inverse(M);

        vec3 o = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 d = normalize((invM * vec4(ray.direction, 0.0)).xyz);

        float halfH = cylinder_height * 0.5;
        float tHit = 1e30;
        vec3 nLocalHit = vec3(0);

        // cylinder sides: x^2 + y^2 = r^2, z in [-h/2, h/2] (Z-axis cylinder)
        float a = d.x*d.x + d.y*d.y;
        float b = 2.0 * (o.x*d.x + o.y*d.y);
        float c = o.x*o.x + o.y*o.y - cylinder_radius*cylinder_radius;

        if (abs(a) > 1e-6) {
            float disc = b*b - 4.0*a*c;
            if (disc >= 0.0) {
                float sd = sqrt(disc);
                float t0 = (-b - sd) / (2.0*a);
                float t1 = (-b + sd) / (2.0*a);
                float ts[2] = float[2](t0, t1);

                for (int i=0; i<2; i++) {
                    if (ts[i] > 0.001) {
                        float zHit = o.z + d.z * ts[i];
                        if (zHit >= -halfH && zHit <= halfH && ts[i] < tHit) {
                            tHit = ts[i];
                            nLocalHit = normalize(vec3(o.x + d.x*ts[i], o.y + d.y*ts[i], 0.0));
                        }
                    }
                }
            }
        }

        // top cap: z = +halfH 
        if (abs(d.z) > 1e-6) {
            float tTop = (halfH - o.z) / d.z;
            if (tTop > 0.001) {
                vec3 p = o + d * tTop;
                if (length(p.xy) <= cylinder_radius && tTop < tHit) {
                    tHit = tTop;
                    nLocalHit = vec3(0, 0, 1);
                }
            }
        }

        // bottom cap: z = -halfH
        if (abs(d.z) > 1e-6) {
            float tBot = (-halfH - o.z) / d.z;
            if (tBot > 0.001) {
                vec3 p = o + d * tBot;
                if (length(p.xy) <= cylinder_radius && tBot < tHit) {
                    tHit = tBot;
                    nLocalHit = vec3(0, 0, -1);
                }
            }
        }

        if (tHit == 1e30) {
            t = 1e30;
            normal = vec3(0);
            return false;
        }

        t = tHit;
        normal = normalize((transpose(invM) * vec4(nLocalHit, 0.0)).xyz);
        return true;
        
    }

    /**
     * 2 - Ellipsoid Intersection Check
     */
    bool intersectEllipsoid(Ray ray, mat4 worldMatrix, float sphere_radius_x, float sphere_radius_y, float sphere_radius_z, out float t, out vec3 normal) {
        
        // Inverse world matrix
        mat4 invM = inverse(worldMatrix);

        // Transform ray into ellipsoid local space
        vec3 localOrigin = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 localDir    = (invM * vec4(ray.direction, 0.0)).xyz; // do NOT normalize

        // Scale to unit sphere
        vec3 oc = localOrigin / vec3(sphere_radius_x, sphere_radius_y, sphere_radius_z);
        vec3 d  = localDir / vec3(sphere_radius_x, sphere_radius_y, sphere_radius_z);

        // Quadratic coefficients for intersection with unit sphere
        float a = dot(d, d);
        float b = 2.0 * dot(oc, d);
        float c = dot(oc, oc) - 1.0;

        float delta = b*b - 4.0*a*c;

        // No intersection
        if (delta < 0.0) {
            t = 1e30;
            normal = vec3(0.0);
            return false;
        }

        float sqrtDelta = sqrt(max(delta, 0.0));
        float t0 = (-b - sqrtDelta) / (2.0 * a);
        float t1 = (-b + sqrtDelta) / (2.0 * a);

        // pick closest positive t
        float tLocal = (t0 > 0.001) ? t0 : ((t1 > 0.001) ? t1 : 1e30);
        if (tLocal == 1e30) {
            normal = vec3(0.0);
            t = 1e30;
            return false;
        }

        // compute hit point in local space
        vec3 hitLocal = localOrigin + localDir * tLocal;

        // compute local normal
        vec3 nLocal = vec3(
            hitLocal.x / (sphere_radius_x * sphere_radius_x),
            hitLocal.y / (sphere_radius_y * sphere_radius_y),
            hitLocal.z / (sphere_radius_z * sphere_radius_z)
        );

        // transform normal to world space
        vec3 nWorld = normalize((transpose(invM) * vec4(nLocal, 0.0)).xyz);
        normal = nWorld;

        // scale t to world space
        float dirScale = length((worldMatrix * vec4(localDir, 0.0)).xyz);
        t = tLocal * dirScale;

        return true;

    }

    /**
     * 3 - RectPrism Intersection Check
     */
    bool intersectRectPrism(Ray ray, mat4 worldMatrix, float sx, float sy, float sz, out float t, out vec3 normal) {

        mat4 M = worldMatrix;
        mat4 invM = inverse(M);

        vec3 o = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 d = normalize((invM * vec4(ray.direction, 0.0)).xyz);

        vec3 minB = vec3(-sx*0.5, -sy*0.5, -sz*0.5);
        vec3 maxB = vec3( sx*0.5,  sy*0.5,  sz*0.5);

        vec3 t0 = (minB - o) / d;
        vec3 t1 = (maxB - o) / d;

        vec3 tmin = min(t0, t1);
        vec3 tmax = max(t0, t1);

        float tNear = max(max(tmin.x, tmin.y), tmin.z);
        float tFar  = min(min(tmax.x, tmax.y), tmax.z);

        if (tNear > tFar || tFar < 0.001) {
            t = 1e30;
            normal = vec3(0);
            return false;
        }

        t = (tNear > 0.001) ? tNear : tFar;
        vec3 hit = o + d * t;

        vec3 nLocal = vec3(0);
        float eps = 1e-4;

        if (abs(hit.x - maxB.x) < eps) nLocal = vec3( 1,0,0);
            else if (abs(hit.x - minB.x) < eps) nLocal = vec3(-1,0,0);
            else if (abs(hit.y - maxB.y) < eps) nLocal = vec3(0, 1,0);
            else if (abs(hit.y - minB.y) < eps) nLocal = vec3(0,-1,0);
            else if (abs(hit.z - maxB.z) < eps) nLocal = vec3(0,0, 1);
            else if (abs(hit.z - minB.z) < eps) nLocal = vec3(0,0,-1);

            normal = normalize((transpose(invM) * vec4(nLocal, 0.0)).xyz);
            return true;

        }

        float sdTorus(vec3 p, float R, float r) {
        vec2 q = vec2(length(p.xy) - R, p.z);
        return length(q) - r;
    }

    /**
     * 4 - Torus Intersection Check
     */
    bool intersectTorus(Ray ray, mat4 worldMatrix, float R, float r, out float t, out vec3 normal) {
        
        mat4 M = worldMatrix;
        mat4 invM = inverse(M);

        vec3 O = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 D = normalize((invM * vec4(ray.direction, 0.0)).xyz);

        t = 0.0;
        const int MAX_STEPS = 150;
        const float EPS = 1e-4;
        const float tMax = 100.0;
        for (int i=0; i<MAX_STEPS && t<tMax; i++) {
            vec3 p = O + D*t;
            float d = sdTorus(p, R, r);
            if (d < EPS) {
                // compute normal via gradient
                vec3 grad;
                float h = 1e-4;
                grad.x = sdTorus(p + vec3(h,0,0), R, r) - d;
                grad.y = sdTorus(p + vec3(0,h,0), R, r) - d;
                grad.z = sdTorus(p + vec3(0,0,h), R, r) - d;
                normal = normalize((transpose(invM) * vec4(grad,0.0)).xyz);
                return true;
            }
            t += d; // sphere tracing step
        }

        t = 1e30;
        normal = vec3(0);
        return false;
    }

    /**
     * Generic function for checking if a ray intersects a primitive
     */
    bool intersectPrimitive(Ray ray, Primitive primitive, out float t, out vec3 normal) {
        // get the primitive shape type
        int shapeType = primitive.shapeType;
        // call shape intersection function
        switch (shapeType) {
            case 0: // cone
                return intersectCone(ray, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
            case 1: // cylinder
                return intersectCylinder(ray, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
            case 2: // ellipsoid
                return intersectEllipsoid(ray, primitive.worldMatrix, primitive.field1, primitive.field2, primitive.field3, t, normal);
            case 3: // rectprism
                return intersectRectPrism(ray, primitive.worldMatrix, primitive.field1, primitive.field2, primitive.field3, t, normal);
            case 4: // torus
                return intersectTorus(ray, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
            default:
                return false;
        }
    }

    // Trace objects in the scene for intersections
    HitData traceScene(Ray ray, bool includeLightSphere) {

        HitData closest;
        closest.hit = false;
        closest.t = 1e30;

        // Light sphere intersection
        if (includeLightSphere) {

            float t; // distance
            vec3 normal; // normal
            if (intersectPrimitive(ray, lightSphere, t, normal)) {
                if (t < closest.t) {
                    closest.hit = true;
                    closest.t = t;
                    closest.color = lightSphere.color;
                    closest.material = lightSphere.material;
                    closest.reflectivity = lightSphere.reflectivity;
                    closest.refractiveIndex = lightSphere.refractiveIndex;
                    vec3 point = ray.origin + (t * ray.direction);
                    closest.point = point;
                    closest.normal = normal;
                    bool front = dot(ray.direction, closest.normal) < 0.0;
                    closest.frontFace = front;
                    if (!front) closest.normal = - closest.normal;
                }
            }
            
            for (int i = 0; i < primitiveCount; i++) {
                float t; // distance
                vec3 normal; // normal
                if (intersectPrimitive(ray, primitives[i], t, normal)) {
                    if (t < closest.t) {
                        HitData new_closest;
                        new_closest.hit = false;
                        new_closest.t = 1e30;
                        return new_closest;
                    }
                }
            }
            return closest;

        } else {
            
            for (int i = 0; i < primitiveCount; i++) {
                float t; // distance
                vec3 normal; // normal
                if (intersectPrimitive(ray, primitives[i], t, normal)) {
                    if (t < closest.t) {
                        // my code
                        closest.hit = true;
                        closest.t = t;
                        closest.color = primitives[i].color;
                        closest.material = primitives[i].material;
                        closest.reflectivity = primitives[i].reflectivity;
                        closest.refractiveIndex = primitives[i].refractiveIndex;
                        closest.point = ray.origin + (t * ray.direction);
                        closest.normal = normal;
                        closest.frontFace = dot(ray.direction, normal) < 0.0;
                    }
                }
            }
            return closest;

        }
        
    }

    // reflection
    vec3 reflection(vec3 I, vec3 N) {
        return reflect(normalize(I), normalize(N));
    }

    // refraction
    vec3 refraction(vec3 I, vec3 N, float eta) {
        return refract(normalize(I), normalize(N), eta);
    }

    // Schlick approximation
    float schlick(float cosine, float n_i, float n_t) {
        float F0 = (n_i - n_t) / (n_i + n_t);
        F0 = F0 * F0;
        return F0 + (1.0 - F0) * pow(1.0 - cosine, 5.0);
    }

    vec3 trace(Ray ray, int maxDepth) {

        // instantiate the color as [0,0,0]
        vec3 color = vec3(0.0); 

        // instantiate attenuation as [1,1,1]
        vec3 attenuation = vec3(1.0);

        // move out of this function later on
        float shadowRatio = 0.001;

        for (int depth = 0; depth < 8; depth++) {
            if (depth >= maxDepth) break;

            HitData lightHit = traceScene(ray, true);

            // if light is hit directly set the color to the light and break
            if (lightHit.hit) {
                color = attenuation * lightHit.color;
                break;
            }

            HitData objectHit = traceScene(ray, false);

            // if we hit no object break set the color to the background and break
            if (!objectHit.hit) {
                color = vec3(1.0, 1.0, 1.0);
                break;
            }

            // get light direction and distance
            vec3 lightDir = normalize(u_lightCenter - objectHit.point);
            float lightDist = length(u_lightCenter - objectHit.point);

            // check shadow ray
            Ray shadowRay = Ray(objectHit.point + objectHit.normal * 0.001, lightDir);
            HitData shadowHit = traceScene(shadowRay, false);

            // if the shadow hits add shadow effect
            bool inShadow = false;
            if (shadowHit.hit && shadowHit.t < lightDist) {
                inShadow = true;
            }

            // ambient light
            vec3 ambientLight = objectHit.color * u_ambientStrength;

            // diffuse light
            vec3 diffuseLight;
            float diff = u_lightStrength * max(dot(normalize(objectHit.normal), normalize(lightDir)), 0.0);
            if (inShadow) {
                diffuseLight = objectHit.color * diff * shadowRatio;
            } else {
                diffuseLight = objectHit.color * diff;
            }

            if (objectHit.material == MATERIAL_DIFFUSE) {

                vec3 lighting = diffuseLight + ambientLight;
                color += lighting;
                break;

            } else if (objectHit.material == MATERIAL_REFRACTIVE) {

                // calculate schlick value
                vec3 N = objectHit.normal;
                float n_i = 1.0; // air
                float n_t = objectHit.refractiveIndex;

                if (dot(ray.direction, N) > 0.0) {
                    N = -N;
                    n_i = 1.52;
                    n_t = 1.0;
                }

                float cosine = clamp(dot(-ray.direction, N), -1.0, 1.0);
                float schlick_value = schlick(cosine, n_i, n_t);

                // check if refraction is possible
                bool TIR_check1 = (n_i > n_t);
                float incident_angle = acos(cosine);
                float sine = sin(incident_angle);
                bool TIR_check2 = sine > (n_t / n_i);
                bool total_internel_reflection = TIR_check1 && TIR_check2;

                vec3 direction;
                if (total_internel_reflection || schlick_value > 0.5) {
                    // reflect
                    direction = reflection(ray.direction, N);
                } else {
                    // refract
                    direction = refraction(ray.direction, N, (n_i / n_t));
                }

                attenuation *= objectHit.color;
                ray = Ray(objectHit.point + direction * 0.001, direction);

            } else {

                attenuation *= objectHit.reflectivity;
                ray = Ray(objectHit.point + objectHit.normal * 0.001, reflect(ray.direction, objectHit.normal));

            }

            if (length(attenuation) < 0.01) break;
        }

        return attenuation * color;
    }

    void main() {

        // initialize the lightSphere
        initLightSphere();

        // instantiate camera view ray
        vec3 origin = u_cameraOrigin;
        vec3 forward = normalize(u_cameraForward);
        vec3 up      = normalize(u_cameraUp);
        vec3 right   = normalize(u_cameraRight);
        float fov = 1.5;
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        vec3 direction = normalize(forward * fov + right * uv.x + up * uv.y);
        Ray ray = Ray(origin, direction);

        // apply ray tracing algorithm to get color
        vec3 color = trace(ray, u_maxBounces);

        // gamma correction
        color = pow(color, vec3(1.0 / 2.2));

        // set the color
        fragColor = vec4(color, 1.0);

    }`