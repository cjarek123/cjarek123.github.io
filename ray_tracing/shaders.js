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

    // lighting
    uniform vec3 u_lightCenter;
    uniform int u_maxBounces;
    uniform float u_ambientStrength;
    uniform float u_lightStrength;
    uniform int u_sph1Mat;
    uniform int u_sph2Mat;
    uniform int u_sph3Mat;

    // Struct for general primitive
    struct Primitive {
        mat4 localMatrix;
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
        Primitive primitives[40];
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
        mat4 localMatrix = mat4(1.0);
        localMatrix[3][0] = u_lightCenter.x;
        localMatrix[3][1] = u_lightCenter.y;
        localMatrix[3][2] = u_lightCenter.z;
        lightSphere.localMatrix = localMatrix;
        lightSphere.worldMatrix = mat4(1.0);
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
    bool intersectCone(Ray ray, mat4 localMatrix, mat4 worldMatrix, float cone_radius, float cone_height, out float t, out vec3 normal) {
        
        // object-to-world and its inverse
        mat4 M = worldMatrix * localMatrix;
        mat4 invM = inverse(M);

        // transform ray into local space
        vec3 O = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 D_un = (invM * vec4(ray.direction, 0.0)).xyz;

        float dirScale = length(D_un);
        if (dirScale < 1e-8) { t = 1e30; normal = vec3(0); return false; }
        vec3 D = D_un / dirScale;

        // define cone so apex at z = 0, base center at z = -h, radius r at base
        float h = cone_height;
        float r = cone_radius;
        float k = r / h;
        float k2 = k * k;

        // move origin so apex is at z=0: O_apex = O - (0,0,+h/2) if your original cone
        // definition had apex at +h/2 and base at -h/2. Here we make apex=0 and base=-h.
        // If your prior local-space used apex at +h/2 & base at -h/2, this shift maps to apex=0.
        vec3 O_apex = O - vec3(0.0, 0.0, h * 0.5);

        // For quadratic, use coordinates relative to apex:
        float ox = O_apex.x;
        float oy = O_apex.y;
        float oz = O_apex.z;

        float dx = D.x;
        float dy = D.y;
        float dz = D.z;

        // Quadratic for the infinite cone (apex at origin, axis = -Z):
        // x^2 + y^2 - (k^2) * z^2 = 0
        float a = dx*dx + dy*dy - k2 * dz*dz;
        float b = 2.0 * (ox*dx + oy*dy - k2 * oz*dz);
        float c = ox*ox + oy*oy - k2 * oz*oz;

        float tLocal = 1e30;
        vec3 nLocalHit = vec3(0.0);

        // body intersection (finite cone: z in [-h, 0])
        if (abs(a) > 1e-6) {
            float delta = b*b - 4.0*a*c;
            if (delta >= 0.0) {
                float sd = sqrt(delta);
                float t0 = (-b - sd) / (2.0 * a);
                float t1 = (-b + sd) / (2.0 * a);
                float ts[2] = float[2](t0, t1);
                for (int i = 0; i < 2; i++) {
                    float ti = ts[i];
                    if (ti > 0.001) {
                        // hit in apex-relative frame
                        vec3 hit = O_apex + D * ti;
                        // finite cone extent check: base at z = -h, apex at z = 0
                        if (hit.z <= 0.0 && hit.z >= -h && ti < tLocal) {
                            tLocal = ti;
                            // gradient of F = (x, y, -k^2 * z) for x^2+y^2 - k^2 z^2 = 0
                            nLocalHit = normalize(vec3(hit.x, hit.y, -k2 * hit.z));
                        }
                    }
                }
            }
        }

        // base disk intersection: plane z = -h (in apex-relative coords)
        if (abs(D.z) > 1e-6) {
            // plane z = -h
            float tBase = (-h - O_apex.z) / D.z;
            if (tBase > 0.001) {
                vec3 pBase = O_apex + D * tBase;
                if (length(pBase.xy) <= r && tBase < tLocal) {
                    tLocal = tBase;
                    nLocalHit = vec3(0.0, 0.0, -1.0); // outward normal for base
                }
            }
        }

        if (tLocal == 1e30) {
            t = 1e30;
            normal = vec3(0.0);
            return false;
        }

        // convert local t back to world t
        t = tLocal * dirScale;

        // transform normal to world space (use inverse-transpose, w=0)
        vec3 nWorld = normalize((transpose(invM) * vec4(nLocalHit, 0.0)).xyz);
        normal = nWorld;

        return true;
    }



    /**
     * 1 - Cylinder Intersection Check
     */
    bool intersectCylinder(Ray ray, mat4 localMatrix, mat4 worldMatrix, float cylinder_radius, float cylinder_height, out float t, out vec3 normal) {

        mat4 M = worldMatrix * localMatrix;
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
    bool intersectEllipsoid(Ray ray, mat4 localMatrix, mat4 worldMatrix, float sphere_radius_x, float sphere_radius_y, float sphere_radius_z, out float t, out vec3 normal) {
        
        // bring the ray into the ellipsoid's local space
        mat4 M = worldMatrix * localMatrix;
        mat4 invM = inverse(M);

        vec3 localOrigin    = (invM * vec4(ray.origin, 1.0)).xyz;
        vec3 localDirection = normalize((invM * vec4(ray.direction, 0.0)).xyz);

        // convert ellipsoid to unit sphere
        vec3 oc = localOrigin;
        vec3 d  = localDirection;
        vec3 r  = vec3(sphere_radius_x, sphere_radius_y, sphere_radius_z);

        vec3 oc_scaled = oc / r;
        vec3 d_scaled  = d  / r;

        float a = dot(d_scaled, d_scaled);
        float b = 2.0 * dot(oc_scaled, d_scaled);
        float c = dot(oc_scaled, oc_scaled) - 1.0;

        float delta = b*b - 4.0*a*c;

        if (delta > 0.0) {
            float s = sqrt(delta);
            float t0 = (-b - s) / (2.0 * a);
            float t1 = (-b + s) / (2.0 * a);
            t = (t0 > 0.001) ? t0 : t1;

        } else if (abs(delta) < 0.0001) {
            t = -b / (2.0 * a);

        } else {
            t = 1e30;
            normal = vec3(0);
            return false;
        }

        if (t <= 0.001) {
            normal = vec3(0);
            return false;
        }

        // compute world space normal

        // hit point in local ellipsoid space
        vec3 hitLocal = oc + d * t;

        // gradient of ellipsoid F(x,y,z)=0 => correct local normal
        vec3 nLocal = vec3(
            hitLocal.x / (sphere_radius_x * sphere_radius_x),
            hitLocal.y / (sphere_radius_y * sphere_radius_y),
            hitLocal.z / (sphere_radius_z * sphere_radius_z)
        );

        // transform normal to world space
        vec3 nWorld = (transpose(invM) * vec4(nLocal, 0.0)).xyz;
        normal = normalize(nWorld);

        return true;

    }

    /**
     * 3 - RectPrism Intersection Check
     */
    bool intersectRectPrism(Ray ray, mat4 localMatrix, mat4 worldMatrix, float sx, float sy, float sz, out float t, out vec3 normal) {

        mat4 M = worldMatrix * localMatrix;
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
    bool intersectTorus(Ray ray, mat4 localMatrix, mat4 worldMatrix, float R, float r, out float t, out vec3 normal) {
        mat4 M = worldMatrix * localMatrix;
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
                return intersectCone(ray, primitive.localMatrix, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
            case 1: // cylinder
                return intersectCylinder(ray, primitive.localMatrix, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
            case 2: // ellipsoid
                return intersectEllipsoid(ray, primitive.localMatrix, primitive.worldMatrix, primitive.field1, primitive.field2, primitive.field3, t, normal);
            case 3: // rectprism
                return intersectRectPrism(ray, primitive.localMatrix, primitive.worldMatrix, primitive.field1, primitive.field2, primitive.field3, t, normal);
            case 4: // torus
                return intersectTorus(ray, primitive.localMatrix, primitive.worldMatrix, primitive.field1, primitive.field2, t, normal);
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
                color = vec3(0.0, 0.0, 0.0);
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
        vec3 forward = u_cameraForward;
        vec3 up      = u_cameraUp;
        vec3 right   = normalize(cross(up, forward));
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