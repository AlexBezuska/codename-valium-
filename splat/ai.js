function distanceSquared(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  dy /= 2;
  return (dx * dx) + (dy * dy);
}

function distanceFromCenters(entity1, entity2) {
  var x1 = entity1.x + (entity1.width / 2);
  var y1 = entity1.y + (entity1.height / 2);

  var x2 = entity2.x + (entity2.width / 2);
  var y2 = entity2.y + (entity2.height / 2);

  return distanceSquared(x1, y1, x2, y2);
}


function chase(entity, target, range) {
  var r2 = range * range;
  if (distanceFromCenters(entity, target) < r2) {
    if (target.x < entity.x) {
      entity.vx = -0.7*chaseSpeedX;
    }
    if (target.x > entity.x) {
      entity.vx = 0.7*chaseSpeedX;
    }
    if (target.y < entity.y) {
      entity.vy = -0.2*chaseSpeedY;
    }
    if (target.y > entity.y) {
      entity.vy = 0.2*chaseSpeedY;
    }
    entity.vx *= entity.frictionX;
    entity.vy *= entity.frictionY;
  }
}