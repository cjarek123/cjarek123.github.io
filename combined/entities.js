/**
 * Stores the entities of the game
 */
class Entities {
    constructor() {
        this.entities = []
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    addEntities(other_entities) {
        for (let i = 0; i < other_entities.entities.length; i++) {
            this.entities.push(other_entities.entities[i]);
        }
    }

    /**
     * update the animations of all entity
     */
    animate(deltaTime) {
        for (const entity of this.entities) {
            entity.animate(deltaTime)
        }
    }
}

/**
 * Entity Base Class
 */
class Entity {
    constructor() {
        if (new.target === Entity) {
            throw new Error("Cannot instantiate abstract class Entity directly");
        }
    }

    animate(deltaTime) {
        throw new Error("Entity.animate(deltaTime) must be implemented by subclass");
    }
}