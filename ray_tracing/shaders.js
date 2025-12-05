const vsSource = `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`

const fsSource = `#version 300 es
    precision highp float;

    // time for animation
    uniform float u_time;
    uniform vec2 u_resolution;
    // lighting
    uniform int u_maxBounces;
    uniform float u_ambientStrength;
    uniform float u_lightStrength;
    uniform int u_sph1Mat;
    uniform int u_sph2Mat;
    uniform int u_sph3Mat;
    // entities

    out vec4 fragColor;

    // Material types
    const int MATERIAL_DIFFUSE = 0;
    const int MATERIAL_REFLECTIVE = 1;
    const int MATERIAL_REFRACTIVE = 2;

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

    // Sphere structure
    struct Sphere {
        vec3 center;
        float radius;
        vec3 color;
        int material;
        float reflectivity;
        float refractiveIndex;
    };

    // Cube structure
    struct Cube {
        vec3 center;
        vec3 size;
        vec3 color;
        int material;
        float reflectivity;
        float refractiveIndex;
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

    // Scene objects
    Sphere lightSphere;
    Sphere spheres[3];
    Cube cubes[10];

    // Initialize scene objects
    void initScene(float time) {

        // // Light sphere
        // lightSphere = Sphere(
        //     vec3(2.0, 0.0, 10.25),
        //     0.1,
        //     vec3(1.0, 1.0, 1.0) * (u_lightStrength / 3.0),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 1 (floor)
        // cubes[0] = Cube(
        //     vec3(0.0, 0.0, 0.0),
        //     vec3(30.0, 10.0, 1.0),
        //     vec3(1.0, 0.0, 1.0),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 2 (right wall)
        // cubes[1] = Cube(
        //     vec3(0.0, 5.5, 5.5),
        //     vec3(30.0, 1.0, 10.0),
        //     vec3(0.0, 1.0, 1.0),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 3 (left wall)
        // cubes[2] = Cube(
        //     vec3(0.0, -5.5, 5.5),
        //     vec3(30.0, 1.0, 10.0),
        //     vec3(1.0, 0.6, 0.0),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 4 (roof)
        // cubes[3] = Cube(
        //     vec3(0.0, 0.0, 11.0),
        //     vec3(30.0, 10.0, 1.0),
        //     vec3(0.7, 0.7, 0.7),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 5 (back wall)
        // cubes[4] = Cube(
        //     vec3(15.5, 0.0, 5.5),
        //     vec3(1.0, 10.0, 10.0),
        //     vec3(1.0, 0.412, 0.706),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 6 (wall behind camera)
        // cubes[5] = Cube(
        //     vec3(-15.5, 0.0, 5.5),
        //     vec3(1.0, 10.0, 10.0),
        //     vec3(1.0, 0.412, 0.706),
        //     MATERIAL_DIFFUSE,
        //     0.00,
        //     0.00
        // );

        // // Cube 7 see thru wall 1
        // cubes[6] = Cube(
        //     vec3(2.0, -3.875, 3),
        //     vec3(0.01, 2.25, 5.0),
        //     vec3(0.2, 0.2, 1.0),
        //     MATERIAL_REFRACTIVE,
        //     0.10,
        //     1.72
        // );

        // // Cube 8 see thru wall 2
        // cubes[7] = Cube(
        //     vec3(2.0, -1.625, 8.0),
        //     vec3(0.01, 2.25, 5.0),
        //     vec3(0.2, 1.0, 0.2),
        //     MATERIAL_REFRACTIVE,
        //     0.10,
        //     1.72
        // );

        // // Cube 9 see thru wall 3
        // cubes[8] = Cube(
        //     vec3(2.0, -1.625, 3),
        //     vec3(0.01, 2.25, 5.0),
        //     vec3(0.65, 0.65, 0.65),
        //     MATERIAL_REFRACTIVE,
        //     0.10,
        //     1.72
        // );

        // // Cube 10 see thru wall 4
        // cubes[9] = Cube(
        //     vec3(2.0, -3.875, 8.0),
        //     vec3(0.01, 2.25, 5.0),
        //     vec3(1.0, 0.2, 0.2),
        //     MATERIAL_REFRACTIVE,
        //     0.10,
        //     1.72
        // );

        // float sphere1Height = (2.7 * sin(u_time + 1.2)) + 5.5;
        // float sphere2Height = (2.7 * sin(u_time)) + 5.5;
        // float sphere3Height = (2.7 * sin(u_time + 2.4)) + 5.5;

        // // Sphere 1
        // spheres[0] = Sphere(
        //     vec3(10.0, 0.5, sphere1Height),
        //     1.5,
        //     vec3(1.0, 0.0, 0.0),
        //     u_sph1Mat == 0 ? MATERIAL_REFLECTIVE : MATERIAL_DIFFUSE,
        //     0.50,
        //     0.00
        // );

        // // Sphere 2
        // spheres[1] = Sphere(
        //     vec3(5.0, -2.25, sphere2Height),
        //     1.5,
        //     vec3(0.0, 1.0, 0.0),
        //     u_sph2Mat == 0 ? MATERIAL_REFLECTIVE : MATERIAL_DIFFUSE,
        //     0.50,
        //     0.00
        // );

        // // Sphere 3
        // spheres[2] = Sphere(
        //     vec3(0.0, 2.0, sphere3Height),
        //     1.5,
        //     vec3(0.0, 0.0, 1.0),
        //     u_sph3Mat == 0 ? MATERIAL_REFLECTIVE : MATERIAL_DIFFUSE,
        //     0.50,
        //     0.00
        // );

    }

    bool intersectSphere(Ray ray, Sphere sphere, out float t) {

        // code from class lecture slides
        vec3 oc = ray.origin - sphere.center;
        float a = dot(ray.direction, ray.direction);
        float b = 2.0 * dot(oc, ray.direction);
        float c = dot(oc, oc) - sphere.radius * sphere.radius;
        float delta = b * b - 4.0 * a * c; 

        // my code

        if (delta > 0.001) { // two intersections

            // calculate t's
            float t0 = (-b - sqrt(delta)) / (2.0 * a);
            float t1 = (-b + sqrt(delta)) / (2.0 * a);

            // code from class lecture slides
            t = t0 > 0.001 ? t0 : t1;
            return (t > 0.001);
        
        } else if (delta < 0.001 && delta > -0.001) { // one intersection

            // calculate t
            t = (-b) / (2.0 * a);

            // code from class lecture slides
            return (t > 0.001);
        
        } else { // no intersection
            t = 1e30;
            return false;
        }

    }

    bool intersectCube(Ray ray, Cube cube, out float t, out vec3 normal) {

        // build the cube planes
        vec3 halfSize = cube.size * 0.5;
        vec3 cubeMin = cube.center - halfSize;
        vec3 cubeMax = cube.center + halfSize;

        Plane planes[6];

        // +X face
        planes[0].normal = vec3(1.0, 0.0, 0.0);
        planes[0].offset = dot(planes[0].normal, vec3(cubeMax.x, cube.center.y, cube.center.z));

        // -X face
        planes[1].normal = vec3(-1.0, 0.0, 0.0);
        planes[1].offset = dot(planes[1].normal, vec3(cubeMin.x, cube.center.y, cube.center.z));

        // +Y face
        planes[2].normal = vec3(0.0, 1.0, 0.0);
        planes[2].offset = dot(planes[2].normal, vec3(cube.center.x, cubeMax.y, cube.center.z));

        // -Y face
        planes[3].normal = vec3(0.0, -1.0, 0.0);
        planes[3].offset = dot(planes[3].normal, vec3(cube.center.x, cubeMin.y, cube.center.z));

        // +Z face
        planes[4].normal = vec3(0.0, 0.0, 1.0);
        planes[4].offset = dot(planes[4].normal, vec3(cube.center.x, cube.center.y, cubeMax.z));

        // -Z face
        planes[5].normal = vec3(0.0, 0.0, -1.0);
        planes[5].offset = dot(planes[5].normal, vec3(cube.center.x, cube.center.y, cubeMin.z));

        // loop over the six planes/slabs of the cube
        bool intersection = false;
        t = 1e30; // reset t to large value
        for (int i = 0; i < 6; i++) {

            Plane plane = planes[i];

            // check if the plane is parallel to the ray
            float dp = dot(ray.direction, plane.normal);
            if (dp < 0.001 && dp > -0.001) continue;

            // calculate the intersect of t and the plane
            float curT = (plane.offset - dot(ray.origin, plane.normal)) / dp;

            // check if the ray is in front of the plane
            if (curT < 0.0) continue;

            // calculate the intersection point of the ray and the plane
            vec3 P = ray.origin + curT * ray.direction;

            // check if the intersection point is inside the cube boundary
            if (plane.normal.x != 0.0) {
                // intersecting X-plane: check Y and Z
                if (P.y < cubeMin.y || P.y > cubeMax.y) continue;
                if (P.z < cubeMin.z || P.z > cubeMax.z) continue;
            }
            else if (plane.normal.y != 0.0) {
                // intersecting Y-plane: check X and Z
                if (P.x < cubeMin.x || P.x > cubeMax.x) continue;
                if (P.z < cubeMin.z || P.z > cubeMax.z) continue;
            }
            else if (plane.normal.z != 0.0) {
                // intersecting Z-plane: check X and Y
                if (P.x < cubeMin.x || P.x > cubeMax.x) continue;
                if (P.y < cubeMin.y || P.y > cubeMax.y) continue;
            }

            // update the minimum t found
            if (curT < t) {
                t = curT;
                normal = plane.normal;
                intersection = true;
            } 

        }

        if (intersection) {
            return true;
        } else {
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
            if (intersectSphere(ray, lightSphere, t)) {
                if (t < closest.t) {
                    // my code
                    closest.hit = true;
                    closest.t = t;
                    closest.color = lightSphere.color;
                    closest.material = lightSphere.material;
                    closest.reflectivity = lightSphere.reflectivity;
                    closest.refractiveIndex = lightSphere.refractiveIndex;
                    vec3 point = ray.origin + (t * ray.direction);
                    closest.point = point;
                    closest.normal = normalize(point - lightSphere.center);
                    bool front = dot(ray.direction, closest.normal) < 0.0;
                    closest.frontFace = front;
                    if (!front) closest.normal = - closest.normal;
                }
            }
            return closest;
        }

        // Cube intersection
        for (int i = 0; i < 10; i++) {
            float t;
            vec3 normal;
            if (intersectCube(ray, cubes[i], t, normal)) {
                if (t < closest.t) {
                    // my code
                    closest.hit = true;
                    closest.t = t;
                    closest.color = cubes[i].color;
                    closest.material = cubes[i].material;
                    closest.reflectivity = cubes[i].reflectivity;
                    closest.refractiveIndex = cubes[i].refractiveIndex;
                    closest.point = ray.origin + (t * ray.direction);
                    closest.normal = normal;
                    closest.frontFace = dot(ray.direction, normal) < 0.0;
                }
            }
        }

        // Sphere intersections
        for (int i = 0; i < 3; i++) {
            float t;
            if (intersectSphere(ray, spheres[i], t)) {
                if (t < closest.t) {
                    // my code
                    closest.hit = true;
                    closest.t = t;
                    closest.color = spheres[i].color;
                    closest.material = spheres[i].material;
                    closest.reflectivity = spheres[i].reflectivity;
                    closest.refractiveIndex = spheres[i].refractiveIndex;
                    vec3 point = ray.origin + (t * ray.direction);
                    closest.point = point;
                    closest.normal = normalize(point - spheres[i].center);
                    bool front = dot(ray.direction, closest.normal) < 0.0;
                    closest.frontFace = front;
                    if (!front) closest.normal = - closest.normal;
                }
            }
        }

        return closest;
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

        // move out of this function later on
        float shadowRatio = 0.001;

        // instantiate the color as [0,0,0]
        vec3 color = vec3(0.0); 

        // instantiate attenuation as [1,1,1]
        vec3 attenuation = vec3(1.0);

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
            vec3 lightDir = normalize(lightSphere.center - objectHit.point);
            float lightDist = length(lightSphere.center - objectHit.point);

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

        //     if (objectHit.material == MATERIAL_DIFFUSE) {

        //         vec3 lighting = diffuseLight + ambientLight;
        //         color += lighting;
        //         break;

        //     } else if (objectHit.material == MATERIAL_REFRACTIVE) {

        //         // calculate schlick value
        //         vec3 N = objectHit.normal;
        //         float n_i = 1.0; // air
        //         float n_t = objectHit.refractiveIndex;

        //         if (dot(ray.direction, N) > 0.0) {
        //             N = -N;
        //             n_i = 1.52;
        //             n_t = 1.0;
        //         }

        //         float cosine = clamp(dot(-ray.direction, N), -1.0, 1.0);
        //         float schlick_value = schlick(cosine, n_i, n_t);

        //         // check if refraction is possible
        //         bool TIR_check1 = (n_i > n_t);
        //         float incident_angle = acos(cosine);
        //         float sine = sin(incident_angle);
        //         bool TIR_check2 = sine > (n_t / n_i);
        //         bool total_internel_reflection = TIR_check1 && TIR_check2;

        //         vec3 direction;
        //         if (total_internel_reflection || schlick_value > 0.5) {
        //             // reflect
        //             direction = reflection(ray.direction, N);
        //         } else {
        //             // refract
        //             direction = refraction(ray.direction, N, (n_i / n_t));
        //         }

        //         attenuation *= objectHit.color;
        //         ray = Ray(objectHit.point + direction * 0.001, direction);

        //     } else {

        //         attenuation *= objectHit.reflectivity;
        //         ray = Ray(objectHit.point + objectHit.normal * 0.001, reflect(ray.direction, objectHit.normal));

        //     }

        //     if (length(attenuation) < 0.01) break;
        }

        return attenuation * color;
    }

    void main() {

        // // initialize the light and object geometries
        // initScene(u_time);

        // // instantiate camera view ray
        // vec3 origin = vec3(-14.5, 0.0, 5.5);
        // vec3 forward = vec3(1.0, 0.0, 0.0);
        // vec3 right   = vec3(0.0, 1.0, 0.0);
        // vec3 up      = vec3(0.0, 0.0, 1.0);
        // float fov = 1.5;
        // vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        // vec3 direction = normalize(forward * fov + right * uv.x + up * uv.y);
        // Ray ray = Ray(origin, direction);

        // // apply ray tracing algorithm to get color
        // vec3 color = trace(ray, u_maxBounces);

        // // gamma correction
        // color = pow(color, vec3(1.0 / 2.2));

        // set the color
        // fragColor = vec4(color, 1.0);
        fragColor = vec4(vec3(1.0,1.0,1.0), 1.0);

    }`