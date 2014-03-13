/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

Object.create = Object.create || function(o) {
	function F() {}
	F.prototype = o;
	return new F();
};
 
//var VERSION = CP_VERSION_MAJOR + "." + CP_VERSION_MINOR + "." + CP_VERSION_RELEASE;

var cp;
if(typeof exports === 'undefined'){
	cp = {};

	if(typeof window === 'object'){
		window.cp = cp;
	}
} else {
	cp = exports;
}

var assert = function(value, message)
{
	if (!value) {
		throw new Error('Assertion failed: ' + message);
	}
};

var assertSoft = function(value, message)
{
	if(!value && console && console.warn) {
		console.warn("ASSERTION FAILED: " + message);
		if(console.trace) {
			console.trace();
		}
	}
};

var hashPair = function(a, b)
{
//	assert(typeof(a) === 'string' || typeof(a) === 'number', "HashPair used on something not a string or a number");
	return a + ' ' + b;
};

var mymin = function(a, b)
{
	return a < b ? a : b;
};
var mymax = function(a, b)
{
	return a > b ? a : b;
};

var min, max;
if (typeof window === 'object' && window.navigator.userAgent.indexOf('Firefox') > -1){
	// On firefox, Math.min and Math.max are really fast:
	// http://jsperf.com/math-vs-greater-than/8
 	min = Math.min;
	max = Math.max;
} else {
	// On chrome and safari, Math.min / max are slooow. The ternery operator above is faster
	// than the builtins because we only have to deal with 2 arguments that are always numbers.
	min = mymin;
	max = mymax;
}

var deleteObjFromList = function(arr, obj)
{
	for(var i=0; i<arr.length; i++){
		if(arr[i] === obj){
			arr[i] = arr[arr.length - 1];
			arr.length--;
			
			return;
		}
	}
};

var momentForCircle = cp.momentForCircle = function(m, r1, r2, offset)
{
	return m*(0.5*(r1*r1 + r2*r2) + vlengthsq(offset));
};

var areaForCircle = cp.areaForCircle = function(r1, r2)
{
	return Math.PI*Math.abs(r1*r1 - r2*r2);
};

var momentForSegment = cp.momentForSegment = function(m, a, b)
{
	var length = vlength(vsub(b, a));
	var offset = vmult(vadd(a, b), 1/2);
	
	return m*(length*length/12 + vlengthsq(offset));
};

var areaForSegment = cp.areaForSegment = function(a, b, r)
{
	return r*(Math.PI*r + 2*vdist(a, b));
};

var momentForPoly = cp.momentForPoly = function(m, verts, offset)
{
	var sum1 = 0;
	var sum2 = 0;
	var len = verts.length;
	for(var i=0; i<len; i+=2){
		var v1x = verts[i] + offset.x;
	 	var v1y = verts[i+1] + offset.y;
		var v2x = verts[(i+2)%len] + offset.x;
		var v2y = verts[(i+3)%len] + offset.y;

		var a = vcross2(v2x, v2y, v1x, v1y);
		var b = vdot2(v1x, v1y, v1x, v1y) + vdot2(v1x, v1y, v2x, v2y) + vdot2(v2x, v2y, v2x, v2y);
		
		sum1 += a*b;
		sum2 += a;
	}
	
	return (m*sum1)/(6*sum2);
};

var areaForPoly = cp.areaForPoly = function(verts)
{
	throw new Error('Not updated for flat verts');
	var area = 0;
	for(var i=0, len=verts.length; i<len; i++){
		area += vcross(verts[i], verts[(i+1)%len]);
	}
	
	return -area/2;
};

var centroidForPoly = cp.centroidForPoly = function(verts)
{
	throw new Error('Not updated for flat verts');
	var sum = 0;
	var vsum = [0,0];
	
	for(var i=0, len=verts.length; i<len; i++){
		var v1 = verts[i];
		var v2 = verts[(i+1)%len];
		var cross = vcross(v1, v2);
		
		sum += cross;
		vsum = vadd(vsum, vmult(vadd(v1, v2), cross));
	}
	
	return vmult(vsum, 1/(3*sum));
};

var recenterPoly = cp.recenterPoly = function(verts)
{
	throw new Error('Not updated for flat verts');
	var centroid = centroidForPoly(verts);
	
	for(var i=0; i<verts.length; i++){
		verts[i] = vsub(verts[i], centroid);
	}
};

var momentForBox = cp.momentForBox = function(m, width, height)
{
	return m*(width*width + height*height)/12;
};

var momentForBox2 = cp.momentForBox2 = function(m, box)
{
	width = box.r - box.l;
	height = box.t - box.b;
	offset = vmult([box.l + box.r, box.b + box.t], 0.5);
	
	// TODO NaN when offset is 0 and m is INFINITY	
	return momentForBox(m, width, height) + m*vlengthsq(offset);
};

/// Clamp @c f to be between @c min and @c max.
var clamp = function(f, minv, maxv)
{
	return min(max(f, minv), maxv);
};

/// Clamp @c f to be between 0 and 1.
var clamp01 = function(f)
{
	return max(0, min(f, 1));
};

/// Linearly interpolate (or extrapolate) between @c f1 and @c f2 by @c t percent.
var lerp = function(f1, f2, t)
{
	return f1*(1 - t) + f2*t;
};

/// Linearly interpolate from @c f1 to @c f2 by no more than @c d.
var lerpconst = function(f1, f2, d)
{
	return f1 + clamp(f2 - f1, -d, d);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// I'm using an array tuple here because (at time of writing) its about 3x faster
// than an object on firefox, and the same speed on chrome.

var numVects = 0;

var traces = {};

var Vect = cp.Vect = function(x, y)
{
	this.x = x;
	this.y = y;
	numVects++;

//	var s = new Error().stack;
//	traces[s] = traces[s] ? traces[s]+1 : 1;
};

cp.v = function (x,y) { return new Vect(x, y) };

var vzero = cp.vzero = new Vect(0,0);

// The functions below *could* be rewritten to be instance methods on Vect. I don't
// know how that would effect performance. For now, I'm keeping the JS similar to
// the original C code.

/// Vector dot product.
var vdot = cp.v.dot = function(v1, v2)
{
	return v1.x*v2.x + v1.y*v2.y;
};

var vdot2 = function(x1, y1, x2, y2)
{
	return x1*x2 + y1*y2;
};

/// Returns the length of v.
var vlength = cp.v.len = function(v)
{
	return Math.sqrt(vdot(v, v));
};

/// Check if two vectors are equal. (Be careful when comparing floating point numbers!)
var veql = cp.v.eql = function(v1, v2)
{
	return (v1.x === v2.x && v1.y === v2.y);
};

/// Add two vectors
var vadd = cp.v.add = function(v1, v2)
{
	return new Vect(v1.x + v2.x, v1.y + v2.y);
};

Vect.prototype.add = function(v2)
{
	this.x += v2.x;
	this.y += v2.y;
	return this;
};

/// Subtract two vectors.
var vsub = cp.v.sub = function(v1, v2)
{
	return new Vect(v1.x - v2.x, v1.y - v2.y);
};

Vect.prototype.sub = function(v2)
{
	this.x -= v2.x;
	this.y -= v2.y;
	return this;
};

/// Negate a vector.
var vneg = cp.v.neg = function(v)
{
	return new Vect(-v.x, -v.y);
};

Vect.prototype.neg = function()
{
	this.x = -this.x;
	this.y = -this.y;
	return this;
};

/// Scalar multiplication.
var vmult = cp.v.mult = function(v, s)
{
	return new Vect(v.x*s, v.y*s);
};

Vect.prototype.mult = function(s)
{
	this.x *= s;
	this.y *= s;
	return this;
};

/// 2D vector cross product analog.
/// The cross product of 2D vectors results in a 3D vector with only a z component.
/// This function returns the magnitude of the z value.
var vcross = cp.v.cross = function(v1, v2)
{
	return v1.x*v2.y - v1.y*v2.x;
};

var vcross2 = function(x1, y1, x2, y2)
{
	return x1*y2 - y1*x2;
};

/// Returns a perpendicular vector. (90 degree rotation)
var vperp = cp.v.perp = function(v)
{
	return new Vect(-v.y, v.x);
};

/// Returns a perpendicular vector. (-90 degree rotation)
var vpvrperp = cp.v.pvrperp = function(v)
{
	return new Vect(v.y, -v.x);
};

/// Returns the vector projection of v1 onto v2.
var vproject = cp.v.project = function(v1, v2)
{
	return vmult(v2, vdot(v1, v2)/vlengthsq(v2));
};

Vect.prototype.project = function(v2)
{
	this.mult(vdot(this, v2) / vlengthsq(v2));
	return this;
};

/// Uses complex number multiplication to rotate v1 by v2. Scaling will occur if v1 is not a unit vector.
var vrotate = cp.v.rotate = function(v1, v2)
{
	return new Vect(v1.x*v2.x - v1.y*v2.y, v1.x*v2.y + v1.y*v2.x);
};

Vect.prototype.rotate = function(v2)
{
	this.x = this.x * v2.x - this.y * v2.y;
	this.y = this.x * v2.y + this.y * v2.x;
	return this;
};

/// Inverse of vrotate().
var vunrotate = cp.v.unrotate = function(v1, v2)
{
	return new Vect(v1.x*v2.x + v1.y*v2.y, v1.y*v2.x - v1.x*v2.y);
};

/// Returns the squared length of v. Faster than vlength() when you only need to compare lengths.
var vlengthsq = cp.v.lengthsq = function(v)
{
	return vdot(v, v);
};

/// Linearly interpolate between v1 and v2.
var vlerp = cp.v.lerp = function(v1, v2, t)
{
	return vadd(vmult(v1, 1 - t), vmult(v2, t));
};

/// Returns a normalized copy of v.
var vnormalize = cp.v.normalize = function(v)
{
	return vmult(v, 1/vlength(v));
};

/// Returns a normalized copy of v or vzero if v was already vzero. Protects against divide by zero errors.
var vnormalize_safe = cp.v.normalize_safe = function(v)
{
	return (v.x === 0 && v.y === 0 ? vzero : vnormalize(v));
};

/// Clamp v to length len.
var vclamp = cp.v.clamp = function(v, len)
{
	return (vdot(v,v) > len*len) ? vmult(vnormalize(v), len) : v;
};

/// Linearly interpolate between v1 towards v2 by distance d.
var vlerpconst = cp.v.lerpconst = function(v1, v2, d)
{
	return vadd(v1, vclamp(vsub(v2, v1), d));
};

/// Returns the distance between v1 and v2.
var vdist = cp.v.dist = function(v1, v2)
{
	return vlength(vsub(v1, v2));
};

/// Returns the squared distance between v1 and v2. Faster than vdist() when you only need to compare distances.
var vdistsq = cp.v.distsq = function(v1, v2)
{
	return vlengthsq(vsub(v1, v2));
};

/// Returns true if the distance between v1 and v2 is less than dist.
var vnear = cp.v.near = function(v1, v2, dist)
{
	return vdistsq(v1, v2) < dist*dist;
};

/// Spherical linearly interpolate between v1 and v2.
var vslerp = cp.v.slerp = function(v1, v2, t)
{
	var omega = Math.acos(vdot(v1, v2));
	
	if(omega) {
		var denom = 1/Math.sin(omega);
		return vadd(vmult(v1, Math.sin((1 - t)*omega)*denom), vmult(v2, Math.sin(t*omega)*denom));
	} else {
		return v1;
	}
};

/// Spherical linearly interpolate between v1 towards v2 by no more than angle a radians
var vslerpconst = cp.v.slerpconst = function(v1, v2, a)
{
	var angle = Math.acos(vdot(v1, v2));
	return vslerp(v1, v2, min(a, angle)/angle);
};

/// Returns the unit length vector for the given angle (in radians).
var vforangle = cp.v.forangle = function(a)
{
	return new Vect(Math.cos(a), Math.sin(a));
};

/// Returns the angular direction v is pointing in (in radians).
var vtoangle = cp.v.toangle = function(v)
{
	return Math.atan2(v.y, v.x);
};

///	Returns a string representation of v. Intended mostly for debugging purposes and not production use.
var vstr = cp.v.str = function(v)
{
	return "(" + v.x.toFixed(3) + ", " + v.y.toFixed(3) + ")";
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// Chipmunk's axis-aligned 2D bounding box type along with a few handy routines.

var numBB = 0;

// Bounding boxes are JS objects with {l, b, r, t} = left, bottom, right, top, respectively.
var BB = function(l, b, r, t)
{
	this.l = l;
	this.b = b;
	this.r = r;
	this.t = t;

	numBB++;
};

var bbNewForCircle = function(p, r)
{
	return new BB(
			p.x - r,
			p.y - r,
			p.x + r,
			p.y + r
		);
};

/// Returns true if @c a and @c b intersect.
var bbIntersects = function(a, b)
{
	return (a.l <= b.r && b.l <= a.r && a.b <= b.t && b.b <= a.t);
};
var bbIntersects2 = function(bb, l, b, r, t)
{
	return (bb.l <= r && l <= bb.r && bb.b <= t && b <= bb.t);
};

/// Returns true if @c other lies completely within @c bb.
var bbContainsBB = function(bb, other)
{
	return (bb.l <= other.l && bb.r >= other.r && bb.b <= other.b && bb.t >= other.t);
};

/// Returns true if @c bb contains @c v.
var bbContainsVect = function(bb, v)
{
	return (bb.l <= v.x && bb.r >= v.x && bb.b <= v.y && bb.t >= v.y);
};
var bbContainsVect2 = function(l, b, r, t, v)
{
	return (l <= v.x && r >= v.x && b <= v.y && t >= v.y);
};

/// Returns a bounding box that holds both bounding boxes.
var bbMerge = function(a, b){
	return new BB(
			min(a.l, b.l),
			min(a.b, b.b),
			max(a.r, b.r),
			max(a.t, b.t)
		);
};

/// Returns a bounding box that holds both @c bb and @c v.
var bbExpand = function(bb, v){
	return new BB(
			min(bb.l, v.x),
			min(bb.b, v.y),
			max(bb.r, v.x),
			max(bb.t, v.y)
		);
};

/// Returns the area of the bounding box.
var bbArea = function(bb)
{
	return (bb.r - bb.l)*(bb.t - bb.b);
};

/// Merges @c a and @c b and returns the area of the merged bounding box.
var bbMergedArea = function(a, b)
{
	return (max(a.r, b.r) - min(a.l, b.l))*(max(a.t, b.t) - min(a.b, b.b));
};

var bbMergedArea2 = function(bb, l, b, r, t)
{
	return (max(bb.r, r) - min(bb.l, l))*(max(bb.t, t) - min(bb.b, b));
};

/// Return true if the bounding box intersects the line segment with ends @c a and @c b.
var bbIntersectsSegment = function(bb, a, b)
{
	return (bbSegmentQuery(bb, a, b) != Infinity);
};

/// Clamp a vector to a bounding box.
var bbClampVect = function(bb, v)
{
	var x = min(max(bb.l, v.x), bb.r);
	var y = min(max(bb.b, v.y), bb.t);
	return new Vect(x, y);
};

// TODO edge case issue
/// Wrap a vector to a bounding box.
var bbWrapVect = function(bb, v)
{
	var ix = Math.abs(bb.r - bb.l);
	var modx = (v.x - bb.l) % ix;
	var x = (modx > 0) ? modx : modx + ix;
	
	var iy = Math.abs(bb.t - bb.b);
	var mody = (v.y - bb.b) % iy;
	var y = (mody > 0) ? mody : mody + iy;
	
	return new Vect(x + bb.l, y + bb.b);
};
/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
/// Segment query info struct.
/* These are created using literals where needed.
typedef struct cpSegmentQueryInfo {
	/// The shape that was hit, null if no collision occured.
	cpShape *shape;
	/// The normalized distance along the query segment in the range [0, 1].
	cpFloat t;
	/// The normal of the surface hit.
	cpVect n;
} cpSegmentQueryInfo;
*/

var shapeIDCounter = 0;

var CP_NO_GROUP = cp.NO_GROUP = 0;
var CP_ALL_LAYERS = cp.ALL_LAYERS = ~0;

cp.resetShapeIdCounter = function()
{
	shapeIDCounter = 0;
};

/// The cpShape struct defines the shape of a rigid body.
//
/// Opaque collision shape struct. Do not create directly - instead use
/// PolyShape, CircleShape and SegmentShape.
var Shape = cp.Shape = function(body) {
	/// The rigid body this collision shape is attached to.
	this.body = body;

	/// The current bounding box of the shape.
	this.bb_l = this.bb_b = this.bb_r = this.bb_t = 0;

	this.hashid = shapeIDCounter++;

	/// Sensor flag.
	/// Sensor shapes call collision callbacks but don't produce collisions.
	this.sensor = false;
	
	/// Coefficient of restitution. (elasticity)
	this.e = 0;
	/// Coefficient of friction.
	this.u = 0;
	/// Surface velocity used when solving for friction.
	this.surface_v = vzero;
	
	/// Collision type of this shape used when picking collision handlers.
	this.collision_type = 0;
	/// Group of this shape. Shapes in the same group don't collide.
	this.group = 0;
	// Layer bitmask for this shape. Shapes only collide if the bitwise and of their layers is non-zero.
	this.layers = CP_ALL_LAYERS;
	
	this.space = null;

	// Copy the collision code from the prototype into the actual object. This makes collision
	// function lookups slightly faster.
	this.collisionCode = this.collisionCode;
};

Shape.prototype.setElasticity = function(e) { this.e = e; };
Shape.prototype.setFriction = function(u) { this.body.activate(); this.u = u; };
Shape.prototype.setLayers = function(layers) { this.body.activate(); this.layers = layers; };

Shape.prototype.active = function()
{
// return shape->prev || shape->body->shapeList == shape;
	return this.body && this.body.shapeList.indexOf(this) !== -1;
};

Shape.prototype.setBody = function(body)
{
	assert(!this.active(), "You cannot change the body on an active shape. You must remove the shape, then ");
	this.body = body;
};

Shape.prototype.cacheBB = function()
{
	return this.update(this.body.p, this.body.rot);
};

Shape.prototype.update = function(pos, rot)
{
	assert(!isNaN(rot.x), 'Rotation is NaN');
	assert(!isNaN(pos.x), 'Position is NaN');
	this.cacheData(pos, rot);
};

Shape.prototype.getBB = function()
{
	return new BB(this.bb_l, this.bb_b, this.bb_r, this.bb_t);
};

/* Not implemented - all these getters and setters. Just edit the object directly.
CP_DefineShapeStructGetter(cpBody*, body, Body);
void cpShapeSetBody(cpShape *shape, cpBody *body);

CP_DefineShapeStructGetter(cpBB, bb, BB);
CP_DefineShapeStructProperty(cpBool, sensor, Sensor, cpTrue);
CP_DefineShapeStructProperty(cpFloat, e, Elasticity, cpFalse);
CP_DefineShapeStructProperty(cpFloat, u, Friction, cpTrue);
CP_DefineShapeStructProperty(cpVect, surface_v, SurfaceVelocity, cpTrue);
CP_DefineShapeStructProperty(cpDataPointer, data, UserData, cpFalse);
CP_DefineShapeStructProperty(cpCollisionType, collision_type, CollisionType, cpTrue);
CP_DefineShapeStructProperty(cpGroup, group, Group, cpTrue);
CP_DefineShapeStructProperty(cpLayers, layers, Layers, cpTrue);
*/

/// Extended point query info struct. Returned from calling pointQuery on a shape.
var PointQueryExtendedInfo = function(shape){
	/// Shape that was hit, NULL if no collision occurred.
	this.shape = shape;
	/// Depth of the point inside the shape.
	this.d = Infinity;
	/// Direction of minimum norm to the shape's surface.
	this.n = vzero;
};

var SegmentQueryInfo = function(shape, t, n){
	/// The shape that was hit, NULL if no collision occured.
	this.shape = shape;
	/// The normalized distance along the query segment in the range [0, 1].
	this.t = t;
	/// The normal of the surface hit.
	this.n = n;
};

/// Get the hit point for a segment query.
SegmentQueryInfo.prototype.hitPoint = function(start, end)
{
	return vlerp(start, end, this.t);
};

/// Get the hit distance for a segment query.
SegmentQueryInfo.prototype.hitDist = function(start, end)
{
	return vdist(start, end) * this.t;
};

// Circles.

var CircleShape = cp.CircleShape = function(body, radius, offset)
{
	this.c = this.tc = offset;
	this.r = radius;
	
	this.type = 'circle';

	Shape.call(this, body);
};

CircleShape.prototype = Object.create(Shape.prototype);

CircleShape.prototype.cacheData = function(p, rot)
{
	//var c = this.tc = vadd(p, vrotate(this.c, rot));
	var c = this.tc = vrotate(this.c, rot).add(p);
	//this.bb = bbNewForCircle(c, this.r);
	var r = this.r;
	this.bb_l = c.x - r;
	this.bb_b = c.y - r;
	this.bb_r = c.x + r;
	this.bb_t = c.y + r;
};

/// Test if a point lies within a shape.
CircleShape.prototype.pointQuery = function(p)
{
	var delta = vsub(p, this.tc);
	var distsq = vlengthsq(delta);
	var r = this.r;
	
	if(distsq < r*r){
		var info = new PointQueryExtendedInfo(this);
		
		var dist = Math.sqrt(distsq);
		info.d = r - dist;
		info.n = vmult(delta, 1/dist);
		return info;
	}
};

var circleSegmentQuery = function(shape, center, r, a, b, info)
{
	// offset the line to be relative to the circle
	a = vsub(a, center);
	b = vsub(b, center);
	
	var qa = vdot(a, a) - 2*vdot(a, b) + vdot(b, b);
	var qb = -2*vdot(a, a) + 2*vdot(a, b);
	var qc = vdot(a, a) - r*r;
	
	var det = qb*qb - 4*qa*qc;
	
	if(det >= 0)
	{
		var t = (-qb - Math.sqrt(det))/(2*qa);
		if(0 <= t && t <= 1){
			return new SegmentQueryInfo(shape, t, vnormalize(vlerp(a, b, t)));
		}
	}
};

CircleShape.prototype.segmentQuery = function(a, b)
{
	return circleSegmentQuery(this, this.tc, this.r, a, b);
};

// The C API has these, and also getters. Its not idiomatic to
// write getters and setters in JS.
/*
CircleShape.prototype.setRadius = function(radius)
{
	this.r = radius;
}

CircleShape.prototype.setOffset = function(offset)
{
	this.c = offset;
}*/

// Segment shape

var SegmentShape = cp.SegmentShape = function(body, a, b, r)
{
	this.a = a;
	this.b = b;
	this.n = vperp(vnormalize(vsub(b, a)));

	this.ta = this.tb = this.tn = null;
	
	this.r = r;
	
	this.a_tangent = vzero;
	this.b_tangent = vzero;
	
	this.type = 'segment';
	Shape.call(this, body);
};

SegmentShape.prototype = Object.create(Shape.prototype);

SegmentShape.prototype.cacheData = function(p, rot)
{
	this.ta = vadd(p, vrotate(this.a, rot));
	this.tb = vadd(p, vrotate(this.b, rot));
	this.tn = vrotate(this.n, rot);
	
	var l,r,b,t;
	
	if(this.ta.x < this.tb.x){
		l = this.ta.x;
		r = this.tb.x;
	} else {
		l = this.tb.x;
		r = this.ta.x;
	}
	
	if(this.ta.y < this.tb.y){
		b = this.ta.y;
		t = this.tb.y;
	} else {
		b = this.tb.y;
		t = this.ta.y;
	}
	
	var rad = this.r;

	this.bb_l = l - rad;
	this.bb_b = b - rad;
	this.bb_r = r + rad;
	this.bb_t = t + rad;
};

SegmentShape.prototype.pointQuery = function(p)
{
	if(!bbContainsVect2(this.bb_l, this.bb_b, this.bb_r, this.bb_t, p)) return;
	
	var a = this.ta;
	var b = this.tb;
	
	var seg_delta = vsub(b, a);
	var closest_t = clamp01(vdot(seg_delta, vsub(p, a))/vlengthsq(seg_delta));
	var closest = vadd(a, vmult(seg_delta, closest_t));

	var delta = vsub(p, closest);
	var distsq = vlengthsq(delta);
	var r = this.r;

	if (distsq < r*r){
		var info = new PointQueryExtendedInfo(this);

		var dist = Math.sqrt(distsq);
		info.d = r - dist;
		info.n = vmult(delta, 1/dist);
		return info;
	}
};

SegmentShape.prototype.segmentQuery = function(a, b)
{
	var n = this.tn;
	var d = vdot(vsub(this.ta, a), n);
	var r = this.r;
	
	var flipped_n = (d > 0 ? vneg(n) : n);
	var n_offset = vsub(vmult(flipped_n, r), a);
	
	var seg_a = vadd(this.ta, n_offset);
	var seg_b = vadd(this.tb, n_offset);
	var delta = vsub(b, a);
	
	if(vcross(delta, seg_a)*vcross(delta, seg_b) <= 0){
		var d_offset = d + (d > 0 ? -r : r);
		var ad = -d_offset;
		var bd = vdot(delta, n) - d_offset;
		
		if(ad*bd < 0){
			return new SegmentQueryInfo(this, ad/(ad - bd), flipped_n);
		}
	} else if(r != 0){
		var info1 = circleSegmentQuery(this, this.ta, this.r, a, b);
		var info2 = circleSegmentQuery(this, this.tb, this.r, a, b);
		
		if (info1){
			return info2 && info2.t < info1.t ? info2 : info1;
		} else {
			return info2;
		}
	}
};

SegmentShape.prototype.setNeighbors = function(prev, next)
{
	this.a_tangent = vsub(prev, this.a);
	this.b_tangent = vsub(next, this.b);
};

SegmentShape.prototype.setEndpoints = function(a, b)
{
	this.a = a;
	this.b = b;
	this.n = vperp(vnormalize(vsub(b, a)));
};

/*
cpSegmentShapeSetRadius(cpShape *shape, cpFloat radius)
{
	this.r = radius;
}*/

/*
CP_DeclareShapeGetter(cpSegmentShape, cpVect, A);
CP_DeclareShapeGetter(cpSegmentShape, cpVect, B);
CP_DeclareShapeGetter(cpSegmentShape, cpVect, Normal);
CP_DeclareShapeGetter(cpSegmentShape, cpFloat, Radius);
*/

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
/// Check that a set of vertexes is convex and has a clockwise winding.
var polyValidate = function(verts)
{
	var len = verts.length;
	for(var i=0; i<len; i+=2){
		var ax = verts[i];
	 	var ay = verts[i+1];
		var bx = verts[(i+2)%len];
		var by = verts[(i+3)%len];
		var cx = verts[(i+4)%len];
		var cy = verts[(i+5)%len];
		
		//if(vcross(vsub(b, a), vsub(c, b)) > 0){
		if(vcross2(bx - ax, by - ay, cx - bx, cy - by) > 0){
			return false;
		}
	}
	
	return true;
};

/// Initialize a polygon shape.
/// The vertexes must be convex and have a clockwise winding.
var PolyShape = cp.PolyShape = function(body, verts, offset)
{
	assert(verts.length >= 4, "Polygons require some verts");
	assert(typeof(verts[0]) === 'number', 'Polygon verticies should be specified in a flattened list');
	// Fail if the user attempts to pass a concave poly, or a bad winding.
	assert(polyValidate(verts), "Polygon is concave or has a reversed winding.");
	
	this.setVerts(verts, offset);
	this.type = 'poly';
	Shape.call(this, body);
};

PolyShape.prototype = Object.create(Shape.prototype);

var Axis = function(n, d) {
	this.n = n;
	this.d = d;
};

PolyShape.prototype.setVerts = function(verts, offset)
{
	var len = verts.length;
	var numVerts = len >> 1;

	// This a pretty bad way to do this in javascript. As a first pass, I want to keep
	// the code similar to the C.
	this.verts = new Array(len);
	this.tVerts = new Array(len);
	this.axes = new Array(numVerts);
	this.tAxes = new Array(numVerts);
	
	for(var i=0; i<len; i+=2){
		//var a = vadd(offset, verts[i]);
		//var b = vadd(offset, verts[(i+1)%numVerts]);
		var ax = verts[i] + offset.x;
	 	var ay = verts[i+1] + offset.y;
		var bx = verts[(i+2)%len] + offset.x;
		var by = verts[(i+3)%len] + offset.y;

		// Inefficient, but only called during object initialization.
		var n = vnormalize(vperp(new Vect(bx-ax, by-ay)));

		this.verts[i  ] = ax;
		this.verts[i+1] = ay;
		this.axes[i>>1] = new Axis(n, vdot2(n.x, n.y, ax, ay));
		this.tAxes[i>>1] = new Axis(new Vect(0,0), 0);
	}
};

/// Initialize a box shaped polygon shape.
var BoxShape = cp.BoxShape = function(body, width, height)
{
	var hw = width/2;
	var hh = height/2;
	
	return BoxShape2(body, new BB(-hw, -hh, hw, hh));
};

/// Initialize an offset box shaped polygon shape.
var BoxShape2 = cp.BoxShape2 = function(body, box)
{
	var verts = [
		box.l, box.b,
		box.l, box.t,
		box.r, box.t,
		box.r, box.b,
	];
	
	return new PolyShape(body, verts, vzero);
};

PolyShape.prototype.transformVerts = function(p, rot)
{
	var src = this.verts;
	var dst = this.tVerts;
	
	var l = Infinity, r = -Infinity;
	var b = Infinity, t = -Infinity;
	
	for(var i=0; i<src.length; i+=2){
		//var v = vadd(p, vrotate(src[i], rot));
		var x = src[i];
	 	var y = src[i+1];

		var vx = p.x + x*rot.x - y*rot.y;
		var vy = p.y + x*rot.y + y*rot.x;

		//console.log('(' + x + ',' + y + ') -> (' + vx + ',' + vy + ')');
		
		dst[i] = vx;
		dst[i+1] = vy;

		l = min(l, vx);
		r = max(r, vx);
		b = min(b, vy);
		t = max(t, vy);
	}

	this.bb_l = l;
	this.bb_b = b;
	this.bb_r = r;
	this.bb_t = t;
};

PolyShape.prototype.transformAxes = function(p, rot)
{
	var src = this.axes;
	var dst = this.tAxes;
	
	for(var i=0; i<src.length; i++){
		var n = vrotate(src[i].n, rot);
		dst[i].n = n;
		dst[i].d = vdot(p, n) + src[i].d;
	}
};

PolyShape.prototype.cacheData = function(p, rot)
{
	this.transformAxes(p, rot);
	this.transformVerts(p, rot);
};

PolyShape.prototype.pointQuery = function(p)
{
//	if(!bbContainsVect(this.shape.bb, p)) return;
	if(!bbContainsVect2(this.bb_l, this.bb_b, this.bb_r, this.bb_t, p)) return;
	
	var info = new PointQueryExtendedInfo(this);
	
	var axes = this.tAxes;
	for(var i=0; i<axes.length; i++){
		var n = axes[i].n;
		var dist = axes[i].d - vdot(n, p);
		
		if(dist < 0){
			return;
		} else if(dist < info.d){
			info.d = dist;
			info.n = n;
		}
	}
	
	return info;
};

PolyShape.prototype.segmentQuery = function(a, b)
{
	var axes = this.tAxes;
	var verts = this.tVerts;
	var numVerts = axes.length;
	var len = numVerts * 2;
	
	for(var i=0; i<numVerts; i++){
		var n = axes[i].n;
		var an = vdot(a, n);
		if(axes[i].d > an) continue;
		
		var bn = vdot(b, n);
		var t = (axes[i].d - an)/(bn - an);
		if(t < 0 || 1 < t) continue;
		
		var point = vlerp(a, b, t);
		var dt = -vcross(n, point);
		var dtMin = -vcross2(n.x, n.y, verts[i*2], verts[i*2+1]);
		var dtMax = -vcross2(n.x, n.y, verts[(i*2+2)%len], verts[(i*2+3)%len]);

		if(dtMin <= dt && dt <= dtMax){
			// josephg: In the original C code, this function keeps
			// looping through axes after finding a match. I *think*
			// this code is equivalent...
			return new SegmentQueryInfo(this, t, n);
		}
	}
};

/*
PolyShape.getNumVerts = function()
{
	return this.verts.length;
};*/

/*
PolyShape.prototype.getVert = function(idx)
{
	return this.verts[idx];
};*/

PolyShape.prototype.valueOnAxis = function(n, d)
{
	var verts = this.tVerts;
	var m = vdot2(n.x, n.y, verts[0], verts[1]);
	
	for(var i=2; i<verts.length; i+=2){
		m = min(m, vdot2(n.x, n.y, verts[i], verts[i+1]));
	}
	
	return m - d;
};

PolyShape.prototype.containsVert = function(vx, vy)
{
	var axes = this.tAxes;
	
	for(var i=0; i<axes.length; i++){
		var n = axes[i].n;
		var dist = vdot2(n.x, n.y, vx, vy) - axes[i].d;
		if(dist > 0) return false;
	}
	
	return true;
};

PolyShape.prototype.containsVertPartial = function(vx, vy, n)
{
	var axes = this.tAxes;
	
	for(var i=0; i<axes.length; i++){
		var n = axes[i].n;
		if(vdot(n, n) < 0) continue;
		var dist = vdot2(n.x, n.y, vx, vy) - axes[i].d;
		if(dist > 0) return false;
	}
	
	return true;
};


/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// @defgroup cpBody cpBody
/// Chipmunk's rigid body type. Rigid bodies hold the physical properties of an object like
/// it's mass, and position and velocity of it's center of gravity. They don't have an shape on their own.
/// They are given a shape by creating collision shapes (cpShape) that point to the body.
/// @{

var Body = cp.Body = function(m, i) {
	/// Function that is called to update the body's velocity.
	/// Override this to customize movement. Defaults to body.updateVelocity
	/// body.velocity_func(gravity, damping, dt);
	Body.prototype.velocity_func = Body.prototype.updateVelocity;

	/// Function that is called to update the body's position.
	/// Override this to customize movement. Defaults to body.updatePosition
	/// body.position_func(dt);
	Body.prototype.position_func = Body.prototype.updatePosition;

	/// Mass of the body.
	/// Must agree with cpBody.m_inv! Use body.setMass() when changing the mass for this reason.
	//this.m;
	/// Mass inverse.
	//this.m_inv;
	
	/// Moment of inertia of the body.
	/// Must agree with cpBody.i_inv! Use body.setMoment() when changing the moment for this reason.
	//this.i;
	/// Moment of inertia inverse.
	//this.i_inv;

	/// Position of the rigid body's center of gravity.
	this.p = new Vect(0,0);
	/// Velocity of the rigid body's center of gravity.
	this.vx = this.vy = 0;
	/// Force acting on the rigid body's center of gravity.
	this.f = new Vect(0,0);
	
	/// Rotation of the body around it's center of gravity in radians.
	/// Must agree with cpBody.rot! Use cpBodySetAngle() when changing the angle for this reason.
	//this.a;
	/// Angular velocity of the body around it's center of gravity in radians/second.
	this.w = 0;
	/// Torque applied to the body around it's center of gravity.
	this.t = 0;
	
	/// Cached unit length vector representing the angle of the body.
	/// Used for fast rotations using cpvrotate().
	//cpVect rot;
	
	/// Maximum velocity allowed when updating the velocity.
	this.v_limit = Infinity;
	/// Maximum rotational rate (in radians/second) allowed when updating the angular velocity.
	this.w_limit = Infinity;
	
	// This stuff is all private.
	this.v_biasx = this.v_biasy = 0;
	this.w_bias = 0;
	
	this.space = null;
	
	this.shapeList = [];
	this.arbiterList = null; // These are both wacky linked lists.
	this.constraintList = null;
	
	// This stuff is used to track information on the collision graph.
	this.nodeRoot = null;
	this.nodeNext = null;
	this.nodeIdleTime = 0;

	// Set this.m and this.m_inv
	this.setMass(m);

	// Set this.i and this.i_inv
	this.setMoment(i);

	// Set this.a and this.rot
	this.rot = new Vect(0,0);
	this.setAngle(0);
};

// I wonder if this should use the constructor style like Body...
var createStaticBody = function()
{
	body = new Body(Infinity, Infinity);
	body.nodeIdleTime = Infinity;

	return body;
};

if (typeof DEBUG !== 'undefined' && DEBUG) {
	var v_assert_nan = function(v, message){assert(v.x == v.x && v.y == v.y, message); };
	var v_assert_infinite = function(v, message){assert(Math.abs(v.x) !== Infinity && Math.abs(v.y) !== Infinity, message);};
	var v_assert_sane = function(v, message){v_assert_nan(v, message); v_assert_infinite(v, message);};

	Body.prototype.sanityCheck = function()
	{
		assert(this.m === this.m && this.m_inv === this.m_inv, "Body's mass is invalid.");
		assert(this.i === this.i && this.i_inv === this.i_inv, "Body's moment is invalid.");
		
		v_assert_sane(this.p, "Body's position is invalid.");
		v_assert_sane(this.f, "Body's force is invalid.");
		assert(this.vx === this.vx && Math.abs(this.vx) !== Infinity, "Body's velocity is invalid.");
		assert(this.vy === this.vy && Math.abs(this.vy) !== Infinity, "Body's velocity is invalid.");

		assert(this.a === this.a && Math.abs(this.a) !== Infinity, "Body's angle is invalid.");
		assert(this.w === this.w && Math.abs(this.w) !== Infinity, "Body's angular velocity is invalid.");
		assert(this.t === this.t && Math.abs(this.t) !== Infinity, "Body's torque is invalid.");
		
		v_assert_sane(this.rot, "Internal error: Body's rotation vector is invalid.");
		
		assert(this.v_limit === this.v_limit, "Body's velocity limit is invalid.");
		assert(this.w_limit === this.w_limit, "Body's angular velocity limit is invalid.");
	};
} else {
	Body.prototype.sanityCheck = function(){};
}

/// Returns true if the body is sleeping.
Body.prototype.isSleeping = function()
{
	return this.nodeRoot !== null;
};

/// Returns true if the body is static.
Body.prototype.isStatic = function()
{
	return this.nodeIdleTime === Infinity;
};

/// Returns true if the body has not been added to a space.
Body.prototype.isRogue = function()
{
	return this.space === null;
};

// It would be nicer to use defineProperty for this, but its about 30x slower:
// http://jsperf.com/defineproperty-vs-setter
Body.prototype.setMass = function(mass)
{
	assert(mass > 0, "Mass must be positive and non-zero.");

	//activate is defined in cpSpaceComponent
	this.activate();
	this.m = mass;
	this.m_inv = 1/mass;
};

Body.prototype.setMoment = function(moment)
{
	assert(moment > 0, "Moment of Inertia must be positive and non-zero.");

	this.activate();
	this.i = moment;
	this.i_inv = 1/moment;
};

Body.prototype.addShape = function(shape)
{
	this.shapeList.push(shape);
};

Body.prototype.removeShape = function(shape)
{
	// This implementation has a linear time complexity with the number of shapes.
	// The original implementation used linked lists instead, which might be faster if
	// you're constantly editing the shape of a body. I expect most bodies will never
	// have their shape edited, so I'm just going to use the simplest possible implemention.
	deleteObjFromList(this.shapeList, shape);
};

var filterConstraints = function(node, body, filter)
{
	if(node === filter){
		return node.next(body);
	} else if(node.a === body){
		node.next_a = filterConstraints(node.next_a, body, filter);
	} else {
		node.next_b = filterConstraints(node.next_b, body, filter);
	}
	
	return node;
};

Body.prototype.removeConstraint = function(constraint)
{
	// The constraint must be in the constraints list when this is called.
	this.constraintList = filterConstraints(this.constraintList, this, constraint);
};

Body.prototype.setPos = function(pos)
{
	this.activate();
	this.sanityCheck();
	this.p = pos;
};

Body.prototype.setVelocity = function(velocity)
{
	this.activate();
	this.vx = velocity.x;
	this.vy = velocity.y;
};

Body.prototype.setAngleInternal = function(angle)
{
	assert(!isNaN(angle), "Internal Error: Attempting to set body's angle to NaN");
	this.a = angle;//fmod(a, (cpFloat)M_PI*2.0f);

	//this.rot = vforangle(angle);
	this.rot.x = Math.cos(angle);
	this.rot.y = Math.sin(angle);
};

Body.prototype.setAngle = function(angle)
{
	this.activate();
	this.sanityCheck();
	this.setAngleInternal(angle);
}

Body.prototype.updateVelocity = function(gravity, damping, dt)
{
	//this.v = vclamp(vadd(vmult(this.v, damping), vmult(vadd(gravity, vmult(this.f, this.m_inv)), dt)), this.v_limit);
	var vx = this.vx * damping + (gravity.x + this.f.x * this.m_inv) * dt;
	var vy = this.vy * damping + (gravity.y + this.f.y * this.m_inv) * dt;

	//var v = vclamp(new Vect(vx, vy), this.v_limit);
	//this.vx = v.x; this.vy = v.y;
	var v_limit = this.v_limit;
	var lensq = vx * vx + vy * vy;
	var scale = (lensq > v_limit*v_limit) ? v_limit / Math.sqrt(len) : 1;
	this.vx = vx * scale;
	this.vy = vy * scale;
	
	var w_limit = this.w_limit;
	this.w = clamp(this.w*damping + this.t*this.i_inv*dt, -w_limit, w_limit);
	
	this.sanityCheck();
};

Body.prototype.updatePosition = function(dt)
{
	//this.p = vadd(this.p, vmult(vadd(this.v, this.v_bias), dt));
	
	//this.p = this.p + (this.v + this.v_bias) * dt;
	this.p.x += (this.vx + this.v_biasx) * dt;
	this.p.y += (this.vy + this.v_biasy) * dt;

	this.setAngleInternal(this.a + (this.w + this.w_bias)*dt);
	
	this.v_biasx = this.v_biasy = 0;
	this.w_bias = 0;
	
	this.sanityCheck();
};

Body.prototype.resetForces = function()
{
	this.activate();
	this.f = new Vect(0,0);
	this.t = 0;
};

Body.prototype.applyForce = function(force, r)
{
	this.activate();
	this.f = vadd(this.f, force);
	this.t += vcross(r, force);
};

Body.prototype.applyImpulse = function(j, r)
{
	this.activate();
	apply_impulse(this, j.x, j.y, r);
};

Body.prototype.getVelAtPoint = function(r)
{
	return vadd(new Vect(this.vx, this.vy), vmult(vperp(r), body.w));
};

/// Get the velocity on a body (in world units) at a point on the body in world coordinates.
Body.prototype.getVelAtWorldPoint = function(point)
{
	return this.getVelAtPoint(vsub(point, body.p));
};

/// Get the velocity on a body (in world units) at a point on the body in local coordinates.
Body.prototype.getVelAtLocalPoint = function(point)
{
	return this.getVelAtPoint(vrotate(point, body.rot));
}

Body.prototype.eachShape = function(func)
{
	for(var i = 0, len = this.shapeList.length; i < len; i++) {
		func(this.shapeList[i]);
	}
};

Body.prototype.eachConstraint = function(func)
{
	var constraint = this.constraintList;
	while(constraint) {
		var next = constraint.next(body);
		func(constraint);
		constraint = next;
	}
};

Body.prototype.eachArbiter = function(func)
{
	var arb = this.arbiterList;
	while(arb){
		var next = arb.next(body);
		
		arb.swappedColl = (this === arb.body_b);
		func(arb);
		
		arb = next;
	}
};

/// Convert body relative/local coordinates to absolute/world coordinates.
Body.prototype.local2World = function(v)
{
	return vadd(this.p, vrotate(v, this.rot));
};

/// Convert body absolute/world coordinates to	relative/local coordinates.
Body.prototype.world2Local = function(v)
{
	return vunrotate(vsub(v, this.p), this.rot);
};

/// Get the kinetic energy of a body.
Body.prototype.kineticEnergy = function()
{
	// Need to do some fudging to avoid NaNs
	var vsq = this.vx*this.vx + this.vy*this.vy;
	var wsq = this.w * this.w;
	return (vsq ? vsq*this.m : 0) + (wsq ? wsq*this.i : 0);
};

/* Copyright (c) 2010 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
	@defgroup cpSpatialIndex cpSpatialIndex
	
	Spatial indexes are data structures that are used to accelerate collision detection
	and spatial queries. Chipmunk provides a number of spatial index algorithms to pick from
	and they are programmed in a generic way so that you can use them for holding more than
	just Shapes.
	
	It works by using pointers to the objects you add and using a callback to ask your code
	for bounding boxes when it needs them. Several types of queries can be performed an index as well
	as reindexing and full collision information. All communication to the spatial indexes is performed
	through callback functions.
	
	Spatial indexes should be treated as opaque structs.
	This means you shouldn't be reading any of the fields directly.

	All spatial indexes define the following methods:
		
	// The number of objects in the spatial index.
	count = 0;

	// Iterate the objects in the spatial index. @c func will be called once for each object.
	each(func);
	
	// Returns true if the spatial index contains the given object.
	// Most spatial indexes use hashed storage, so you must provide a hash value too.
	contains(obj, hashid);

	// Add an object to a spatial index.
	insert(obj, hashid);

	// Remove an object from a spatial index.
	remove(obj, hashid);
	
	// Perform a full reindex of a spatial index.
	reindex();

	// Reindex a single object in the spatial index.
	reindexObject(obj, hashid);

	// Perform a point query against the spatial index, calling @c func for each potential match.
	// A pointer to the point will be passed as @c obj1 of @c func.
	// func(shape);
	pointQuery(point, func);

	// Perform a segment query against the spatial index, calling @c func for each potential match.
	// func(shape);
	segmentQuery(vect a, vect b, t_exit, func);

	// Perform a rectangle query against the spatial index, calling @c func for each potential match.
	// func(shape);
	query(bb, func);

	// Simultaneously reindex and find all colliding objects.
	// @c func will be called once for each potentially overlapping pair of objects found.
	// If the spatial index was initialized with a static index, it will collide it's objects against that as well.
	reindexQuery(func);
*/

var SpatialIndex = cp.SpatialIndex = function(staticIndex)
{
	this.staticIndex = staticIndex;
	
	if(staticIndex){
		assert(!staticIndex.dynamicIndex, "This static index is already associated with a dynamic index.");
		staticIndex.dynamicIndex = this;
	}
};

// Collide the objects in an index against the objects in a staticIndex using the query callback function.
SpatialIndex.prototype.collideStatic = function(staticIndex, func)
{
	if(staticIndex.count > 0){
		var query = staticIndex.query;

		this.each(function(obj) {
			query(obj, new BB(obj.bb_l, obj.bb_b, obj.bb_r, obj.bb_t), func);
		});
	}
};


/* Copyright (c) 2009 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// This file implements a modified AABB tree for collision detection.

var BBTree = cp.BBTree = function(staticIndex)
{
	SpatialIndex.call(this, staticIndex);
	
	this.velocityFunc = null;

	// This is a hash from object ID -> object for the objects stored in the BBTree.
	this.leaves = {};
	// A count of the number of leaves in the BBTree.
	this.count = 0;

	this.root = null;
	
	// An object pool of tree nodes and pairs.
	//this.pooledNodes = [];
	//this.pooledPairs = [];
	
	this.stamp = 0;
};

BBTree.prototype = Object.create(SpatialIndex.prototype);

var numNodes = 0;

var Node = function(tree, a, b)
{
	//Node *node = NodeFromPool(tree);
	this.obj = null;
	//this.bb = bbMerge(a.bb, b.bb);
	this.bb_l = min(a.bb_l, b.bb_l);
	this.bb_b = min(a.bb_b, b.bb_b);
	this.bb_r = max(a.bb_r, b.bb_r);
	this.bb_t = max(a.bb_t, b.bb_t);
	this.parent = null;
	
	this.setA(a);
	this.setB(b);
	numNodes++;
};

var numLeaves = 0;
var Leaf = function(tree, obj)
{
	//Node *node = NodeFromPool(tree);

	this.obj = obj;
	//this.bb = tree.getBB(obj);
	tree.getBB(obj, this);

	this.parent = null;

	this.stamp = 1;
	this.pairs = null;
	numLeaves++;
};

// **** Misc Functions

BBTree.prototype.getBB = function(obj, dest)
{
	var velocityFunc = this.velocityFunc;
	if(velocityFunc){
		var coef = 0.1;
		var x = (obj.bb_r - obj.bb_l)*coef;
		var y = (obj.bb_t - obj.bb_b)*coef;
		
		var v = vmult(velocityFunc(obj), 0.1);

		dest.bb_l = obj.bb_l + min(-x, v.x);
		dest.bb_b = obj.bb_b + min(-y, v.y);
		dest.bb_r = obj.bb_r + max( x, v.x);
		dest.bb_t = obj.bb_t + max( y, v.y);
	} else {
		dest.bb_l = obj.bb_l;
		dest.bb_b = obj.bb_b;
		dest.bb_r = obj.bb_r;
		dest.bb_t = obj.bb_t;
	}
};

BBTree.prototype.getStamp = function()
{
	var dynamic = this.dynamicIndex;
	return (dynamic && dynamic.stamp ? dynamic.stamp : this.stamp);
};

BBTree.prototype.incrementStamp = function()
{
	if(this.dynamicIndex && this.dynamicIndex.stamp){
		this.dynamicIndex.stamp++;
	} else {
		this.stamp++;
	}
}

// **** Pair/Thread Functions

// Objects created with constructors are faster than object literals. :(
var Pair = function(a, b)
{
	this.a = a; this.b = b;
};

var Thread = function(leaf, next)
{
	this.prev = null;
	this.next = next;
	this.leaf = leaf;
};

// Benchmark this code with object pools on & off.
/*
BBTree.prototype.pairRecycle = function(pair)
{
	this.pooledPairs.push(pair);
};

BBTree.prototype.pairFromPool = function()
{
	return this.pooledPairs.pop() || new Pair(null, null);
};
*/

Thread.prototype.unlink = function()
{
	var next = this.next;
	var prev = this.prev;
	
	if(next){
		if(next.a.leaf == this.leaf) next.a.prev = prev; else next.b.prev = prev;
	}
	
	if(prev){
		if(prev.a.leaf == this.leaf) prev.a.next = next; else prev.b.next = next;
	} else {
		this.leaf.pairs = next;
	}
};

Leaf.prototype.clearPairs = function(tree)
{
	var pair = this.pairs,
		next;

	this.pairs = null;
	
	while(pair){
		if(pair.a.leaf == this){
			next = pair.a.next;
			pair.b.unlink();
			//tree.pairRecycle(pair);
			pair = next;
		} else {
			next = pair.b.next;
			pair.a.unlink();
			//tree.pairRecycle(pair);
			pair = next;
		}
	}
}

var pairInsert = function(a, b, tree)
{
	var nextA = a.pairs, nextB = b.pairs;
	var pair = new Pair(new Thread(a, nextA), new Thread(b, nextB));
	a.pairs = b.pairs = pair;

	//var pair = tree.pairFromPool();
	//Pair temp = {{null, a, nextA},{null, b, nextB}};
	//*pair = temp;
	
	if(nextA){
		if(nextA.a.leaf == a) nextA.a.prev = pair; else nextA.b.prev = pair;
	}
	
	if(nextB){
		if(nextB.a.leaf == b) nextB.a.prev = pair; else nextB.b.prev = pair;
	}
};

// **** Node Functions

/*
static void
NodeRecycle(bbTree *tree, Node *node)
{
	node.parent = tree.pooledNodes;
	tree.pooledNodes = node;
}

static Node *
NodeFromPool(bbTree *tree)
{
	Node *node = tree.pooledNodes;
	
	if(node){
		tree.pooledNodes = node.parent;
		return node;
	} else {
		// Pool is exhausted, make more
	}
}*/

Node.prototype.setA = function(value)
{
	this.A = value;
	value.parent = this;
};

Node.prototype.setB = function(value)
{
	this.B = value;
	value.parent = this;
};

/*
static inline cpBool
NodeIsLeaf(Node *node)
{
	return (node.obj != null);
}*/
Leaf.prototype.isLeaf = true;
Node.prototype.isLeaf = false;

Node.prototype.otherChild = function(child)
{
	return (this.A == child ? this.B : this.A);
};

Node.prototype.replaceChild = function(child, value, tree)
{
	assertSoft(child == this.A || child == this.B, "Node is not a child of parent.");
	
	if(this.A == child){
		//NodeRecycle(tree, parent.A);
		this.setA(value);
	} else {
		//NodeRecycle(tree, parent.B);
		this.setB(value);
	}
	
	for(var node=this; node; node = node.parent){
		//node.bb = bbMerge(node.A.bb, node.B.bb);
		var a = node.A;
		var b = node.B;
		node.bb_l = min(a.bb_l, b.bb_l);
		node.bb_b = min(a.bb_b, b.bb_b);
		node.bb_r = max(a.bb_r, b.bb_r);
		node.bb_t = max(a.bb_t, b.bb_t);
	}
};

Node.prototype.bbArea = Leaf.prototype.bbArea = function()
{
	return (this.bb_r - this.bb_l)*(this.bb_t - this.bb_b);
};

var bbTreeMergedArea = function(a, b)
{
	return (max(a.bb_r, b.bb_r) - min(a.bb_l, b.bb_l))*(max(a.bb_t, b.bb_t) - min(a.bb_b, b.bb_b));
};

// **** Subtree Functions

// Would it be better to make these functions instance methods on Node and Leaf?

var bbProximity = function(a, b)
{
	return Math.abs(a.bb_l + a.bb_r - b.bb_l - b.bb_r) + Math.abs(a.bb_b + b.bb_t - b.bb_b - b.bb_t);
}

var subtreeInsert = function(subtree, leaf, tree)
{
//	var s = new Error().stack;
//	traces[s] = traces[s] ? traces[s]+1 : 1;

	if(subtree == null){
		return leaf;
	} else if(subtree.isLeaf){
		return new Node(tree, leaf, subtree);
	} else {
		var cost_a = subtree.B.bbArea() + bbTreeMergedArea(subtree.A, leaf);
		var cost_b = subtree.A.bbArea() + bbTreeMergedArea(subtree.B, leaf);
		
		if(cost_a === cost_b){
			cost_a = bbProximity(subtree.A, leaf);
			cost_b = bbProximity(subtree.B, leaf);
		}	

		if(cost_b < cost_a){
			subtree.setB(subtreeInsert(subtree.B, leaf, tree));
		} else {
			subtree.setA(subtreeInsert(subtree.A, leaf, tree));
		}
		
//		subtree.bb = bbMerge(subtree.bb, leaf.bb);
		subtree.bb_l = min(subtree.bb_l, leaf.bb_l);
		subtree.bb_b = min(subtree.bb_b, leaf.bb_b);
		subtree.bb_r = max(subtree.bb_r, leaf.bb_r);
		subtree.bb_t = max(subtree.bb_t, leaf.bb_t);

		return subtree;
	}
};

Node.prototype.intersectsBB = Leaf.prototype.intersectsBB = function(bb)
{
	return (this.bb_l <= bb.r && bb.l <= this.bb_r && this.bb_b <= bb.t && bb.b <= this.bb_t);
};

var subtreeQuery = function(subtree, bb, func)
{
	//if(bbIntersectsBB(subtree.bb, bb)){
	if(subtree.intersectsBB(bb)){
		if(subtree.isLeaf){
			func(subtree.obj);
		} else {
			subtreeQuery(subtree.A, bb, func);
			subtreeQuery(subtree.B, bb, func);
		}
	}
};

/// Returns the fraction along the segment query the node hits. Returns Infinity if it doesn't hit.
var nodeSegmentQuery = function(node, a, b)
{
	var idx = 1/(b.x - a.x);
	var tx1 = (node.bb_l == a.x ? -Infinity : (node.bb_l - a.x)*idx);
	var tx2 = (node.bb_r == a.x ?  Infinity : (node.bb_r - a.x)*idx);
	var txmin = min(tx1, tx2);
	var txmax = max(tx1, tx2);
	
	var idy = 1/(b.y - a.y);
	var ty1 = (node.bb_b == a.y ? -Infinity : (node.bb_b - a.y)*idy);
	var ty2 = (node.bb_t == a.y ?  Infinity : (node.bb_t - a.y)*idy);
	var tymin = min(ty1, ty2);
	var tymax = max(ty1, ty2);
	
	if(tymin <= txmax && txmin <= tymax){
		var min_ = max(txmin, tymin);
		var max_ = min(txmax, tymax);
		
		if(0.0 <= max_ && min_ <= 1.0) return max(min_, 0.0);
	}
	
	return Infinity;
};

var subtreeSegmentQuery = function(subtree, a, b, t_exit, func)
{
	if(subtree.isLeaf){
		return func(subtree.obj);
	} else {
		var t_a = nodeSegmentQuery(subtree.A, a, b);
		var t_b = nodeSegmentQuery(subtree.B, a, b);
		
		if(t_a < t_b){
			if(t_a < t_exit) t_exit = min(t_exit, subtreeSegmentQuery(subtree.A, a, b, t_exit, func));
			if(t_b < t_exit) t_exit = min(t_exit, subtreeSegmentQuery(subtree.B, a, b, t_exit, func));
		} else {
			if(t_b < t_exit) t_exit = min(t_exit, subtreeSegmentQuery(subtree.B, a, b, t_exit, func));
			if(t_a < t_exit) t_exit = min(t_exit, subtreeSegmentQuery(subtree.A, a, b, t_exit, func));
		}
		
		return t_exit;
	}
};

/*
static void
SubtreeRecycle(bbTree *tree, Node *node)
{
	if(!NodeIsLeaf(node)){
		SubtreeRecycle(tree, node.A);
		SubtreeRecycle(tree, node.B);
		NodeRecycle(tree, node);
	}
}*/

var subtreeRemove = function(subtree, leaf, tree)
{
	if(leaf == subtree){
		return null;
	} else {
		var parent = leaf.parent;
		if(parent == subtree){
			var other = subtree.otherChild(leaf);
			other.parent = subtree.parent;
			//NodeRecycle(tree, subtree);
			return other;
		} else {
			parent.parent.replaceChild(parent, parent.otherChild(leaf), tree);
			return subtree;
		}
	}
};

// **** Marking Functions

/*
typedef struct MarkContext {
	bbTree *tree;
	Node *staticRoot;
	cpSpatialIndexQueryFunc func;
} MarkContext;
*/

var bbTreeIntersectsNode = function(a, b)
{
	return (a.bb_l <= b.bb_r && b.bb_l <= a.bb_r && a.bb_b <= b.bb_t && b.bb_b <= a.bb_t);
};

var markLeafQuery = function(subtree, leaf, left, tree, func)
{
	if(bbTreeIntersectsNode(leaf, subtree)){
		if(subtree.isLeaf){
			if(left){
				pairInsert(leaf, subtree, tree);
			} else {
				if(subtree.stamp < leaf.stamp) pairInsert(subtree, leaf, tree);
				if(func) func(leaf.obj, subtree.obj);
			}
		} else {
			markLeafQuery(subtree.A, leaf, left, tree, func);
			markLeafQuery(subtree.B, leaf, left, tree, func);
		}
	}
};

var markLeaf = function(leaf, tree, staticRoot, func)
{
	if(leaf.stamp == tree.getStamp()){
		if(staticRoot) markLeafQuery(staticRoot, leaf, false, tree, func);
		
		for(var node = leaf; node.parent; node = node.parent){
			if(node == node.parent.A){
				markLeafQuery(node.parent.B, leaf, true, tree, func);
			} else {
				markLeafQuery(node.parent.A, leaf, false, tree, func);
			}
		}
	} else {
		var pair = leaf.pairs;
		while(pair){
			if(leaf == pair.b.leaf){
				if(func) func(pair.a.leaf.obj, leaf.obj);
				pair = pair.b.next;
			} else {
				pair = pair.a.next;
			}
		}
	}
};

var markSubtree = function(subtree, tree, staticRoot, func)
{
	if(subtree.isLeaf){
		markLeaf(subtree, tree, staticRoot, func);
	} else {
		markSubtree(subtree.A, tree, staticRoot, func);
		markSubtree(subtree.B, tree, staticRoot, func);
	}
};

// **** Leaf Functions

Leaf.prototype.containsObj = function(obj)
{
	return (this.bb_l <= obj.bb_l && this.bb_r >= obj.bb_r && this.bb_b <= obj.bb_b && this.bb_t >= obj.bb_t);
};

Leaf.prototype.update = function(tree)
{
	var root = tree.root;
	var obj = this.obj;

	//if(!bbContainsBB(this.bb, bb)){
	if(!this.containsObj(obj)){
		tree.getBB(this.obj, this);
		
		root = subtreeRemove(root, this, tree);
		tree.root = subtreeInsert(root, this, tree);
		
		this.clearPairs(tree);
		this.stamp = tree.getStamp();
		
		return true;
	}
	
	return false;
};

Leaf.prototype.addPairs = function(tree)
{
	var dynamicIndex = tree.dynamicIndex;
	if(dynamicIndex){
		var dynamicRoot = dynamicIndex.root;
		if(dynamicRoot){
			markLeafQuery(dynamicRoot, this, true, dynamicIndex, null);
		}
	} else {
		var staticRoot = tree.staticIndex.root;
		markLeaf(this, tree, staticRoot, null);
	}
};

// **** Insert/Remove

BBTree.prototype.insert = function(obj, hashid)
{
	var leaf = new Leaf(this, obj);

	this.leaves[hashid] = leaf;
	this.root = subtreeInsert(this.root, leaf, this);
	this.count++;
	
	leaf.stamp = this.getStamp();
	leaf.addPairs(this);
	this.incrementStamp();
};

BBTree.prototype.remove = function(obj, hashid)
{
	var leaf = this.leaves[hashid];

	delete this.leaves[hashid];
	this.root = subtreeRemove(this.root, leaf, this);
	this.count--;

	leaf.clearPairs(this);
	//NodeRecycle(tree, leaf);
};

BBTree.prototype.contains = function(obj, hashid)
{
	return this.leaves[hashid] != null;
};

// **** Reindex
var voidQueryFunc = function(obj1, obj2){};

BBTree.prototype.reindexQuery = function(func)
{
	if(!this.root) return;
	
	// LeafUpdate() may modify this.root. Don't cache it.
	var hashid,
		leaves = this.leaves;
	for (hashid in leaves)
	{
		leaves[hashid].update(this);
	}
	
	var staticIndex = this.staticIndex;
	var staticRoot = staticIndex && staticIndex.root;
	
	markSubtree(this.root, this, staticRoot, func);
	if(staticIndex && !staticRoot) this.collideStatic(this, staticIndex, func);
	
	this.incrementStamp();
};

BBTree.prototype.reindex = function()
{
	this.reindexQuery(voidQueryFunc);
};

BBTree.prototype.reindexObject = function(obj, hashid)
{
	var leaf = this.leaves[hashid];
	if(leaf){
		if(leaf.update(this)) leaf.addPairs(this);
		this.incrementStamp();
	}
};

// **** Query

BBTree.prototype.pointQuery = function(point, func)
{
	// The base collision object is the provided point.
	if(this.root) subtreeQuery(this.root, new BB(point.x, point.y, point.x, point.y), func);
};

BBTree.prototype.segmentQuery = function(a, b, t_exit, func)
{
	if(this.root) subtreeSegmentQuery(this.root, a, b, t_exit, func);
};

BBTree.prototype.query = function(bb, func)
{
	if(this.root) subtreeQuery(this.root, bb, func);
};

// **** Misc

BBTree.prototype.count = function()
{
	return this.count;
};

BBTree.prototype.each = function(func)
{
	var hashid;
	for(hashid in this.leaves)
	{
		func(this.leaves[hashid].obj);
	}
};

// **** Tree Optimization

var bbTreeMergedArea2 = function(node, l, b, r, t)
{
	return (max(node.bb_r, r) - min(node.bb_l, l))*(max(node.bb_t, t) - min(node.bb_b, b));
};

var partitionNodes = function(tree, nodes, offset, count)
{
	if(count == 1){
		return nodes[offset];
	} else if(count == 2) {
		return new Node(tree, nodes[offset], nodes[offset + 1]);
	}
	
	// Find the AABB for these nodes
	//var bb = nodes[offset].bb;
	var node = nodes[offset];
	var bb_l = node.bb_l,
		bb_b = node.bb_b,
		bb_r = node.bb_r,
		bb_t = node.bb_t;

	var end = offset + count;
	for(var i=offset + 1; i<end; i++){
		//bb = bbMerge(bb, nodes[i].bb);
		node = nodes[i];
		bb_l = min(bb_l, node.bb_l);
		bb_b = min(bb_b, node.bb_b);
		bb_r = max(bb_r, node.bb_r);
		bb_t = max(bb_t, node.bb_t);
	}
	
	// Split it on it's longest axis
	var splitWidth = (bb_r - bb_l > bb_t - bb_b);
	
	// Sort the bounds and use the median as the splitting point
	var bounds = new Array(count*2);
	if(splitWidth){
		for(var i=offset; i<end; i++){
			bounds[2*i + 0] = nodes[i].bb_l;
			bounds[2*i + 1] = nodes[i].bb_r;
		}
	} else {
		for(var i=offset; i<end; i++){
			bounds[2*i + 0] = nodes[i].bb_b;
			bounds[2*i + 1] = nodes[i].bb_t;
		}
	}
	
	bounds.sort(function(a, b) {
		// This might run faster if the function was moved out into the global scope.
		return a - b;
	});
	var split = (bounds[count - 1] + bounds[count])*0.5; // use the median as the split

	// Generate the child BBs
	//var a = bb, b = bb;
	var a_l = bb_l, a_b = bb_b, a_r = bb_r, a_t = bb_t;
	var b_l = bb_l, b_b = bb_b, b_r = bb_r, b_t = bb_t;

	if(splitWidth) a_r = b_l = split; else a_t = b_b = split;
	
	// Partition the nodes
	var right = end;
	for(var left=offset; left < right;){
		var node = nodes[left];
//	if(bbMergedArea(node.bb, b) < bbMergedArea(node.bb, a)){
		if(bbTreeMergedArea2(node, b_l, b_b, b_r, b_t) < bbTreeMergedArea2(node, a_l, a_b, a_r, a_t)){
			right--;
			nodes[left] = nodes[right];
			nodes[right] = node;
		} else {
			left++;
		}
	}
	
	if(right == count){
		var node = null;
		for(var i=offset; i<end; i++) node = subtreeInsert(node, nodes[i], tree);
		return node;
	}
	
	// Recurse and build the node!
	return NodeNew(tree,
		partitionNodes(tree, nodes, offset, right - offset),
		partitionNodes(tree, nodes, right, end - right)
	);
};

//static void
//bbTreeOptimizeIncremental(bbTree *tree, int passes)
//{
//	for(int i=0; i<passes; i++){
//		Node *root = tree.root;
//		Node *node = root;
//		int bit = 0;
//		unsigned int path = tree.opath;
//		
//		while(!NodeIsLeaf(node)){
//			node = (path&(1<<bit) ? node.a : node.b);
//			bit = (bit + 1)&(sizeof(unsigned int)*8 - 1);
//		}
//		
//		root = subtreeRemove(root, node, tree);
//		tree.root = subtreeInsert(root, node, tree);
//	}
//}

BBTree.prototype.optimize = function()
{
	var nodes = new Array(this.count);
	var i = 0;

	for (var hashid in this.leaves)
	{
		nodes[i++] = this.nodes[hashid];
	}
	
	//SubtreeRecycle(tree, root);
	this.root = partitionNodes(tree, nodes, nodes.length);
};

// **** Debug Draw

var nodeRender = function(node, depth)
{
	if(!node.isLeaf && depth <= 10){
		nodeRender(node.a, depth + 1);
		nodeRender(node.b, depth + 1);
	}
	
//	var bb = node.bb;
	
	var str = '';
	for(var i = 0; i < depth; i++) {
		str += ' ';
	}

//	console.log(str + bb.b + ' ' + bb.t);
};

BBTree.prototype.log = function(){
	if(this.root) nodeRender(this.root, 0);
};

/*
static void
NodeRender(Node *node, int depth)
{
	if(!NodeIsLeaf(node) && depth <= 10){
		NodeRender(node.a, depth + 1);
		NodeRender(node.b, depth + 1);
	}
	
	bb bb = node.bb;
	
//	GLfloat v = depth/2.0f;	
//	glColor3f(1.0f - v, v, 0.0f);
	glLineWidth(max(5.0f - depth, 1.0f));
	glBegin(GL_LINES); {
		glVertex2f(bb.l, bb.b);
		glVertex2f(bb.l, bb.t);
		
		glVertex2f(bb.l, bb.t);
		glVertex2f(bb.r, bb.t);
		
		glVertex2f(bb.r, bb.t);
		glVertex2f(bb.r, bb.b);
		
		glVertex2f(bb.r, bb.b);
		glVertex2f(bb.l, bb.b);
	}; glEnd();
}

void
bbTreeRenderDebug(cpSpatialIndex *index){
	if(index.klass != &klass){
		cpAssertWarn(false, "Ignoring bbTreeRenderDebug() call to non-tree spatial index.");
		return;
	}
	
	bbTree *tree = (bbTree *)index;
	if(tree.root) NodeRender(tree.root, 0);
}
*/
/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// @defgroup cpArbiter cpArbiter
/// The cpArbiter struct controls pairs of colliding shapes.
/// They are also used in conjuction with collision handler callbacks
/// allowing you to retrieve information on the collision and control it.


// **** Collision Handlers
//
// Collision handlers are user-defined objects to describe the behaviour of colliding
// objects.
var CollisionHandler = cp.CollisionHandler = function()
{
	// The collision type
	this.a = this.b = 0;
};

/// Collision begin event callback
/// Returning false from a begin callback causes the collision to be ignored until
/// the the separate callback is called when the objects stop colliding.
CollisionHandler.prototype.begin = function(arb, space){return true;};

/// Collision pre-solve event callback
/// Returning false from a pre-step callback causes the collision to be ignored until the next step.
CollisionHandler.prototype.preSolve = function(arb, space){return true;};

/// Collision post-solve event function callback type.
CollisionHandler.prototype.postSolve = function(arb, space){};
/// Collision separate event function callback type.
CollisionHandler.prototype.separate = function(arb, space){};


var CP_MAX_CONTACTS_PER_ARBITER = 4;

// Arbiter states
//
// Arbiter is active and its the first collision.
//	'first coll'
// Arbiter is active and its not the first collision.
//	'normal',
// Collision has been explicitly ignored.
// Either by returning false from a begin collision handler or calling cpArbiterIgnore().
//	'ignore',
// Collison is no longer active. A space will cache an arbiter for up to cpSpace.collisionPersistence more steps.
//	'cached'

/// A colliding pair of shapes.
var Arbiter = function(a, b) {
	/// Calculated value to use for the elasticity coefficient.
	/// Override in a pre-solve collision handler for custom behavior.
	this.e = 0;
	/// Calculated value to use for the friction coefficient.
	/// Override in a pre-solve collision handler for custom behavior.
	this.u = 0;
	/// Calculated value to use for applying surface velocities.
	/// Override in a pre-solve collision handler for custom behavior.
	this.surface_vr = vzero;
	
	this.a = a; this.body_a = a.body;
	this.b = b; this.body_b = b.body;
	
	this.thread_a_next = this.thread_a_prev = null;
	this.thread_b_next = this.thread_b_prev = null;
	
	this.contacts = null;
	
	this.stamp = 0;
	this.handler = null;
	this.swappedColl = false;
	this.state = 'first coll';
};

/// Calculate the total impulse that was applied by this arbiter.
/// This function should only be called from a post-solve, post-step or cpBodyEachArbiter callback.
Arbiter.prototype.totalImpulse = function()
{
	var contacts = this.contacts;
	var sum = new Vect(0,0);
	
	for(var i=0, count=contacts.length; i<count; i++){
		var con = contacts[i];
		sum.add(vmult(con.n, con.jnAcc));
	}
	
	return this.swappedColl ? sum : sum.neg();
};

/// Calculate the total impulse including the friction that was applied by this arbiter.
/// This function should only be called from a post-solve, post-step or cpBodyEachArbiter callback.
Arbiter.prototype.totalImpulseWithFriction = function()
{
	var contacts = this.contacts;
	var sum = new Vect(0,0);
	
	for(var i=0, count=contacts.length; i<count; i++){
		var con = contacts[i];
		sum.add(new Vect(con.jnAcc, con.jtAcc).rotate(con.n));
	}

	return this.swappedColl ? sum : sum.neg();
};

/// Calculate the amount of energy lost in a collision including static, but not dynamic friction.
/// This function should only be called from a post-solve, post-step or cpBodyEachArbiter callback.
Arbiter.prototype.totalKE = function()
{
	var eCoef = (1 - arb.e)/(1 + arb.e);
	var sum = 0;
	
	var contacts = arb.contacts;
	for(var i=0, count=contacts.length; i<count; i++){
		var con = contacts[i];
		var jnAcc = con.jnAcc;
		var jtAcc = con.jtAcc;
		
		sum += eCoef*jnAcc*jnAcc/con.nMass + jtAcc*jtAcc/con.tMass;
	}
	
	return sum;
};

/// Causes a collision pair to be ignored as if you returned false from a begin callback.
/// If called from a pre-step callback, you will still need to return false
/// if you want it to be ignored in the current step.
Arbiter.prototype.ignore = function()
{
	this.state = 'ignore';
};

/// Return the colliding shapes involved for this arbiter.
/// The order of their cpSpace.collision_type values will match
/// the order set when the collision handler was registered.
Arbiter.prototype.getA = function()
{
	return this.swappedColl ? this.b : this.a;
};

Arbiter.prototype.getB = function()
{
	return this.swappedColl ? this.a : this.b;
};

/// Returns true if this is the first step a pair of objects started colliding.
Arbiter.prototype.isFirstContact = function()
{
	return this.state === 'first coll';
};

/// A struct that wraps up the important collision data for an arbiter.
var ContactPoint = function(point, normal, dist)
{
	this.point = point;
	this.normal = normal;
	this.dist = dist;
};

/// Return a contact set from an arbiter.
Arbiter.prototype.getContactPointSet = function()
{
	var set = new Array(this.contacts.length);
	
	var i;
	for(i=0; i<set.length; i++){
		set[i] = new ContactPoint(this.contacts[i].p, this.contacts[i].n, this.contacts[i].dist);
	}
	
	return set;
};

/// Get the normal of the @c ith contact point.
Arbiter.prototype.getNormal = function(i)
{
	var n = this.contacts[i].n;
	return this.swappedColl ? vneg(n) : n;
};

/// Get the position of the @c ith contact point.
Arbiter.prototype.getPoint = function(i)
{
	return this.contacts[i].p;
};

/// Get the depth of the @c ith contact point.
Arbiter.prototype.getDepth = function(i)
{
	return this.contacts[i].dist;
};

/*
Arbiter.prototype.threadForBody = function(body)
{
	return (this.body_a === body ? this.thread_a : this.thread_b);
};*/

var unthreadHelper = function(arb, body, prev, next)
{
	// thread_x_y is quite ugly, but it avoids making unnecessary js objects per arbiter.
	if(prev){
		// cpArbiterThreadForBody(prev, body)->next = next;
		if(prev.body_a === body) {
			prev.thread_a_next = next;
		} else {
			prev.thread_b_next = next;
		}
	} else {
		body.arbiterList = next;
	}
	
	if(next){
		// cpArbiterThreadForBody(next, body)->prev = prev;
		if(next.body_a === body){
			next.thread_a_prev = prev;
		} else {
			next.thread_b_prev = prev;
		}
	}
};

Arbiter.prototype.unthread = function()
{
	unthreadHelper(this, this.body_a, this.thread_a_prev, this.thread_a_next);
	unthreadHelper(this, this.body_b, this.thread_b_prev, this.thread_b_next);
	this.thread_a_prev = this.thread_a_next = null;
	this.thread_b_prev = this.thread_b_next = null;
};

//cpFloat
//cpContactsEstimateCrushingImpulse(cpContact *contacts, int numContacts)
//{
//	cpFloat fsum = 0;
//	cpVect vsum = vzero;
//	
//	for(int i=0; i<numContacts; i++){
//		cpContact *con = &contacts[i];
//		cpVect j = vrotate(con.n, v(con.jnAcc, con.jtAcc));
//		
//		fsum += vlength(j);
//		vsum = vadd(vsum, j);
//	}
//	
//	cpFloat vmag = vlength(vsum);
//	return (1 - vmag/fsum);
//}

Arbiter.prototype.update = function(contacts, handler, a, b)
{
	// Arbiters without contact data may exist if a collision function rejected the collision.
	if(this.contacts){
		// Iterate over the possible pairs to look for hash value matches.
		for(var i=0; i<this.contacts.length; i++){
			var old = this.contacts[i];
			
			for(var j=0; j<contacts.length; j++){
				var new_contact = contacts[j];
				
				// This could trigger false positives, but is fairly unlikely nor serious if it does.
				if(new_contact.hash === old.hash){
					// Copy the persistant contact information.
					new_contact.jnAcc = old.jnAcc;
					new_contact.jtAcc = old.jtAcc;
				}
			}
		}
	}
	
	this.contacts = contacts;
	
	this.handler = handler;
	this.swappedColl = (a.collision_type !== handler.a);
	
	this.e = a.e * b.e;
	this.u = a.u * b.u;
	this.surface_vr = vsub(a.surface_v, b.surface_v);
	
	// For collisions between two similar primitive types, the order could have been swapped.
	this.a = a; this.body_a = a.body;
	this.b = b; this.body_b = b.body;
	
	// mark it as new if it's been cached
	if(this.state == 'cached') this.state = 'first coll';
};

Arbiter.prototype.preStep = function(dt, slop, bias)
{
	var a = this.body_a;
	var b = this.body_b;
	
	for(var i=0; i<this.contacts.length; i++){
		var con = this.contacts[i];
		
		// Calculate the offsets.
		con.r1 = vsub(con.p, a.p);
		con.r2 = vsub(con.p, b.p);
		
		// Calculate the mass normal and mass tangent.
		con.nMass = 1/k_scalar(a, b, con.r1, con.r2, con.n);
		con.tMass = 1/k_scalar(a, b, con.r1, con.r2, vperp(con.n));
	
		// Calculate the target bias velocity.
		con.bias = -bias*min(0, con.dist + slop)/dt;
		con.jBias = 0;
		
		// Calculate the target bounce velocity.
		con.bounce = normal_relative_velocity(a, b, con.r1, con.r2, con.n)*this.e;
	}
};

Arbiter.prototype.applyCachedImpulse = function(dt_coef)
{
	if(this.isFirstContact()) return;
	
	var a = this.body_a;
	var b = this.body_b;
	
	for(var i=0; i<this.contacts.length; i++){
		var con = this.contacts[i];
		//var j = vrotate(con.n, new Vect(con.jnAcc, con.jtAcc));
		var nx = con.n.x;
		var ny = con.n.y;
		var jx = nx*con.jnAcc - ny*con.jtAcc;
		var jy = nx*con.jtAcc + ny*con.jnAcc;
		//apply_impulses(a, b, con.r1, con.r2, vmult(j, dt_coef));
		apply_impulses(a, b, con.r1, con.r2, jx * dt_coef, jy * dt_coef);
	}
};

// TODO is it worth splitting velocity/position correction?

var numApplyImpulse = 0;
var numApplyContact = 0;

Arbiter.prototype.applyImpulse = function()
{
	numApplyImpulse++;
	//if (!this.contacts) { throw new Error('contacts is undefined'); }
	var a = this.body_a;
	var b = this.body_b;
	var surface_vr = this.surface_vr;
	var friction = this.u;

	for(var i=0; i<this.contacts.length; i++){
		numApplyContact++;
		var con = this.contacts[i];
		var nMass = con.nMass;
		var n = con.n;
		var r1 = con.r1;
		var r2 = con.r2;
		
		//var vr = relative_velocity(a, b, r1, r2);
		var vrx = b.vx - r2.y * b.w - (a.vx - r1.y * a.w);
		var vry = b.vy + r2.x * b.w - (a.vy + r1.x * a.w);
		
		//var vb1 = vadd(vmult(vperp(r1), a.w_bias), a.v_bias);
		//var vb2 = vadd(vmult(vperp(r2), b.w_bias), b.v_bias);
		//var vbn = vdot(vsub(vb2, vb1), n);

		var vbn = n.x*(b.v_biasx - r2.y * b.w_bias - a.v_biasx + r1.y * a.w_bias) +
				n.y*(r2.x*b.w_bias + b.v_biasy - r1.x * a.w_bias - a.v_biasy);

		var vrn = vdot2(vrx, vry, n.x, n.y);
		//var vrt = vdot(vadd(vr, surface_vr), vperp(n));
		var vrt = vdot2(vrx + surface_vr.x, vry + surface_vr.y, -n.y, n.x);
		
		var jbn = (con.bias - vbn)*nMass;
		var jbnOld = con.jBias;
		con.jBias = max(jbnOld + jbn, 0);
		
		var jn = -(con.bounce + vrn)*nMass;
		var jnOld = con.jnAcc;
		con.jnAcc = max(jnOld + jn, 0);
		
		var jtMax = friction*con.jnAcc;
		var jt = -vrt*con.tMass;
		var jtOld = con.jtAcc;
		con.jtAcc = clamp(jtOld + jt, -jtMax, jtMax);
		
		//apply_bias_impulses(a, b, r1, r2, vmult(n, con.jBias - jbnOld));
		var bias_x = n.x * (con.jBias - jbnOld);
		var bias_y = n.y * (con.jBias - jbnOld);
		apply_bias_impulse(a, -bias_x, -bias_y, r1);
		apply_bias_impulse(b, bias_x, bias_y, r2);

		//apply_impulses(a, b, r1, r2, vrotate(n, new Vect(con.jnAcc - jnOld, con.jtAcc - jtOld)));
		var rot_x = con.jnAcc - jnOld;
		var rot_y = con.jtAcc - jtOld;

		// Inlining apply_impulses decreases speed for some reason :/
		apply_impulses(a, b, r1, r2, n.x*rot_x - n.y*rot_y, n.x*rot_y + n.y*rot_x);
	}
};

Arbiter.prototype.callSeparate = function(space)
{
	// The handler needs to be looked up again as the handler cached on the arbiter may have been deleted since the last step.
	var handler = space.lookupHandler(this.a.collision_type, this.b.collision_type);
	handler.separate(this, space);
};

// From chipmunk_private.h
Arbiter.prototype.next = function(body)
{
	return (this.body_a == body ? this.thread_a_next : this.thread_b_next);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var numContacts = 0;

var Contact = function(p, n, dist, hash)
{
	this.p = p;
	this.n = n;
	this.dist = dist;
	
	this.r1 = this.r2 = vzero;
	this.nMass = this.tMass = this.bounce = this.bias = 0;

	this.jnAcc = this.jtAcc = this.jBias = 0;
	
	this.hash = hash;
	numContacts++;
};

var NONE = [];

// Add contact points for circle to circle collisions.
// Used by several collision tests.
var circle2circleQuery = function(p1, p2, r1, r2)
{
	var mindist = r1 + r2;
	var delta = vsub(p2, p1);
	var distsq = vlengthsq(delta);
	if(distsq >= mindist*mindist) return;
	
	var dist = Math.sqrt(distsq);

	// Allocate and initialize the contact.
	return new Contact(
		vadd(p1, vmult(delta, 0.5 + (r1 - 0.5*mindist)/(dist ? dist : Infinity))),
		(dist ? vmult(delta, 1/dist) : new Vect(1, 0)),
		dist - mindist,
		0
	);
};

// Collide circle shapes.
var circle2circle = function(circ1, circ2)
{
	var contact = circle2circleQuery(circ1.tc, circ2.tc, circ1.r, circ2.r);
	return contact ? [contact] : NONE;
};

var circle2segment = function(circleShape, segmentShape)
{
	var seg_a = segmentShape.ta;
	var seg_b = segmentShape.tb;
	var center = circleShape.tc;
	
	var seg_delta = vsub(seg_b, seg_a);
	var closest_t = clamp01(vdot(seg_delta, vsub(center, seg_a))/vlengthsq(seg_delta));
	var closest = vadd(seg_a, vmult(seg_delta, closest_t));
	
	var contact = circle2circleQuery(center, closest, circleShape.r, segmentShape.r);
	if(contact){
		var n = contact.n;
		
		// Reject endcap collisions if tangents are provided.
		return (
			(closest_t === 0 && vdot(n, segmentShape.a_tangent) < 0) ||
			(closest_t === 1 && vdot(n, segmentShape.b_tangent) < 0)
		) ? NONE : [contact];
	} else {
		return NONE;
	}
}

// Find the minimum separating axis for the given poly and axis list.
//
// This function needs to return two values - the index of the min. separating axis and
// the value itself. Short of inlining MSA, returning values through a global like this
// is the fastest implementation.
//
// See: http://jsperf.com/return-two-values-from-function/2
var last_MSA_min = 0;
var findMSA = function(poly, axes)
{
	var min_index = 0;
	var min = poly.valueOnAxis(axes[0].n, axes[0].d);
	if(min > 0) return -1;
	
	for(var i=1; i<axes.length; i++){
		var dist = poly.valueOnAxis(axes[i].n, axes[i].d);
		if(dist > 0) {
			return -1;
		} else if(dist > min){
			min = dist;
			min_index = i;
		}
	}
	
	last_MSA_min = min;
	return min_index;
};

// Add contacts for probably penetrating vertexes.
// This handles the degenerate case where an overlap was detected, but no vertexes fall inside
// the opposing polygon. (like a star of david)
var findVertsFallback = function(poly1, poly2, n, dist)
{
	var arr = [];

	var verts1 = poly1.tVerts;
	for(var i=0; i<verts1.length; i+=2){
		var vx = verts1[i];
		var vy = verts1[i+1];
		if(poly2.containsVertPartial(vx, vy, vneg(n))){
			arr.push(new Contact(new Vect(vx, vy), n, dist, hashPair(poly1.hashid, i)));
		}
	}
	
	var verts2 = poly2.tVerts;
	for(var i=0; i<verts2.length; i+=2){
		var vx = verts2[i];
		var vy = verts2[i+1];
		if(poly1.containsVertPartial(vx, vy, n)){
			arr.push(new Contact(new Vect(vx, vy), n, dist, hashPair(poly2.hashid, i)));
		}
	}
	
	return arr;
};

// Add contacts for penetrating vertexes.
var findVerts = function(poly1, poly2, n, dist)
{
	var arr = [];

	var verts1 = poly1.tVerts;
	for(var i=0; i<verts1.length; i+=2){
		var vx = verts1[i];
		var vy = verts1[i+1];
		if(poly2.containsVert(vx, vy)){
			arr.push(new Contact(new Vect(vx, vy), n, dist, hashPair(poly1.hashid, i>>1)));
		}
	}
	
	var verts2 = poly2.tVerts;
	for(var i=0; i<verts2.length; i+=2){
		var vx = verts2[i];
		var vy = verts2[i+1];
		if(poly1.containsVert(vx, vy)){
			arr.push(new Contact(new Vect(vx, vy), n, dist, hashPair(poly2.hashid, i>>1)));
		}
	}
	
	return (arr.length ? arr : findVertsFallback(poly1, poly2, n, dist));
};

// Collide poly shapes together.
var poly2poly = function(poly1, poly2)
{
	var mini1 = findMSA(poly2, poly1.tAxes);
	if(mini1 == -1) return NONE;
	var min1 = last_MSA_min;
	
	var mini2 = findMSA(poly1, poly2.tAxes);
	if(mini2 == -1) return NONE;
	var min2 = last_MSA_min;
	
	// There is overlap, find the penetrating verts
	if(min1 > min2)
		return findVerts(poly1, poly2, poly1.tAxes[mini1].n, min1);
	else
		return findVerts(poly1, poly2, vneg(poly2.tAxes[mini2].n), min2);
};

// Like cpPolyValueOnAxis(), but for segments.
var segValueOnAxis = function(seg, n, d)
{
	var a = vdot(n, seg.ta) - seg.r;
	var b = vdot(n, seg.tb) - seg.r;
	return min(a, b) - d;
};

// Identify vertexes that have penetrated the segment.
var findPointsBehindSeg = function(arr, seg, poly, pDist, coef) 
{
	var dta = vcross(seg.tn, seg.ta);
	var dtb = vcross(seg.tn, seg.tb);
	var n = vmult(seg.tn, coef);
	
	var verts = poly.tVerts;
	for(var i=0; i<verts.length; i+=2){
		var vx = verts[i];
		var vy = verts[i+1];
		if(vdot2(vx, vy, n.x, n.y) < vdot(seg.tn, seg.ta)*coef + seg.r){
			var dt = vcross2(seg.tn.x, seg.tn.y, vx, vy);
			if(dta >= dt && dt >= dtb){
				arr.push(new Contact(new Vect(vx, vy), n, pDist, hashPair(poly.hashid, i)));
			}
		}
	}
};

// This one is complicated and gross. Just don't go there...
// TODO: Comment me!
var seg2poly = function(seg, poly)
{
	var arr = [];

	var axes = poly.tAxes;
	var numVerts = axes.length;
	
	var segD = vdot(seg.tn, seg.ta);
	var minNorm = poly.valueOnAxis(seg.tn, segD) - seg.r;
	var minNeg = poly.valueOnAxis(vneg(seg.tn), -segD) - seg.r;
	if(minNeg > 0 || minNorm > 0) return NONE;
	
	var mini = 0;
	var poly_min = segValueOnAxis(seg, axes[0].n, axes[0].d);
	if(poly_min > 0) return NONE;
	for(var i=0; i<numVerts; i++){
		var dist = segValueOnAxis(seg, axes[i].n, axes[i].d);
		if(dist > 0){
			return NONE;
		} else if(dist > poly_min){
			poly_min = dist;
			mini = i;
		}
	}
	
	var poly_n = vneg(axes[mini].n);
	
	var va = vadd(seg.ta, vmult(poly_n, seg.r));
	var vb = vadd(seg.tb, vmult(poly_n, seg.r));
	if(poly.containsVert(va.x, va.y))
		arr.push(new Contact(va, poly_n, poly_min, hashPair(seg.hashid, 0)));
	if(poly.containsVert(vb.x, vb.y))
		arr.push(new Contact(vb, poly_n, poly_min, hashPair(seg.hashid, 1)));
	
	// Floating point precision problems here.
	// This will have to do for now.
//	poly_min -= cp_collision_slop; // TODO is this needed anymore?
	
	if(minNorm >= poly_min || minNeg >= poly_min) {
		if(minNorm > minNeg)
			findPointsBehindSeg(arr, seg, poly, minNorm, 1);
		else
			findPointsBehindSeg(arr, seg, poly, minNeg, -1);
	}
	
	// If no other collision points are found, try colliding endpoints.
	if(arr.length === 0){
		var mini2 = mini * 2;
		var verts = poly.tVerts;

		var poly_a = new Vect(verts[mini2], verts[mini2+1]);
		
		var con;
		if((con = circle2circleQuery(seg.ta, poly_a, seg.r, 0, arr))) return [con];
		if((con = circle2circleQuery(seg.tb, poly_a, seg.r, 0, arr))) return [con];

		var len = numVerts * 2;
		var poly_b = new Vect(verts[(mini2+2)%len], verts[(mini2+3)%len]);
		if((con = circle2circleQuery(seg.ta, poly_b, seg.r, 0, arr))) return [con];
		if((con = circle2circleQuery(seg.tb, poly_b, seg.r, 0, arr))) return [con];
	}

//	console.log(poly.tVerts, poly.tAxes);
//	console.log('seg2poly', arr);
	return arr;
};

// This one is less gross, but still gross.
// TODO: Comment me!
var circle2poly = function(circ, poly)
{
	var axes = poly.tAxes;
	
	var mini = 0;
	var min = vdot(axes[0].n, circ.tc) - axes[0].d - circ.r;
	for(var i=0; i<axes.length; i++){
		var dist = vdot(axes[i].n, circ.tc) - axes[i].d - circ.r;
		if(dist > 0){
			return NONE;
		} else if(dist > min) {
			min = dist;
			mini = i;
		}
	}
	
	var n = axes[mini].n;

	var verts = poly.tVerts;
	var len = verts.length;
	var mini2 = mini<<1;

	//var a = poly.tVerts[mini];
	//var b = poly.tVerts[(mini + 1)%poly.tVerts.length];
	var ax = verts[mini2];
	var ay = verts[mini2+1];
	var bx = verts[(mini2+2)%len];
	var by = verts[(mini2+3)%len];

	var dta = vcross2(n.x, n.y, ax, ay);
	var dtb = vcross2(n.x, n.y, bx, by);
	var dt = vcross(n, circ.tc);
		
	if(dt < dtb){
		var con = circle2circleQuery(circ.tc, new Vect(bx, by), circ.r, 0, con);
		return con ? [con] : NONE;
	} else if(dt < dta) {
		return [new Contact(
			vsub(circ.tc, vmult(n, circ.r + min/2)),
			vneg(n),
			min,
			0
		)];
	} else {
		var con = circle2circleQuery(circ.tc, new Vect(ax, ay), circ.r, 0, con);
		return con ? [con] : NONE;
	}
};

// The javascripty way to do this would be either nested object or methods on the prototypes.
// 
// However, the *fastest* way is the method below.
// See: http://jsperf.com/dispatch

// These are copied from the prototypes into the actual objects in the Shape constructor.
CircleShape.prototype.collisionCode = 0;
SegmentShape.prototype.collisionCode = 1;
PolyShape.prototype.collisionCode = 2;

CircleShape.prototype.collisionTable = [
	circle2circle,
	circle2segment,
	circle2poly
];

SegmentShape.prototype.collisionTable = [
	null,
	function(seg, seg) { return NONE; }, // seg2seg
	seg2poly
];

PolyShape.prototype.collisionTable = [
	null,
	null,
	poly2poly
];

var collideShapes = cp.collideShapes = function(a, b)
{
	assert(a.collisionCode <= b.collisionCode, 'Collided shapes must be sorted by type');
	return a.collisionTable[b.collisionCode](a, b);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var defaultCollisionHandler = new CollisionHandler();

/// Basic Unit of Simulation in Chipmunk
var Space = cp.Space = function() {
	this.stamp = 0;
	this.curr_dt = 0;

	this.bodies = [];
	this.rousedBodies = [];
	this.sleepingComponents = [];
	
	this.staticShapes = new BBTree(null);
	this.activeShapes = new BBTree(this.staticShapes);
	
	this.arbiters = [];
	this.contactBuffersHead = null;
	this.cachedArbiters = {};
	//this.pooledArbiters = [];
	
	this.constraints = [];
	
	this.locked = 0;
	
	this.collisionHandlers = {};
	this.defaultHandler = defaultCollisionHandler;

	this.postStepCallbacks = [];
	
	/// Number of iterations to use in the impulse solver to solve contacts.
	this.iterations = 10;
	
	/// Gravity to pass to rigid bodies when integrating velocity.
	this.gravity = vzero;
	
	/// Damping rate expressed as the fraction of velocity bodies retain each second.
	/// A value of 0.9 would mean that each body's velocity will drop 10% per second.
	/// The default value is 1.0, meaning no damping is applied.
	/// @note This damping value is different than those of cpDampedSpring and cpDampedRotarySpring.
	this.damping = 1;
	
	/// Speed threshold for a body to be considered idle.
	/// The default value of 0 means to let the space guess a good threshold based on gravity.
	this.idleSpeedThreshold = 0;
	
	/// Time a group of bodies must remain idle in order to fall asleep.
	/// Enabling sleeping also implicitly enables the the contact graph.
	/// The default value of Infinity disables the sleeping algorithm.
	this.sleepTimeThreshold = Infinity;
	
	/// Amount of encouraged penetration between colliding shapes..
	/// Used to reduce oscillating contacts and keep the collision cache warm.
	/// Defaults to 0.1. If you have poor simulation quality,
	/// increase this number as much as possible without allowing visible amounts of overlap.
	this.collisionSlop = 0.1;
	
	/// Determines how fast overlapping shapes are pushed apart.
	/// Expressed as a fraction of the error remaining after each second.
	/// Defaults to pow(1.0 - 0.1, 60.0) meaning that Chipmunk fixes 10% of overlap each frame at 60Hz.
	this.collisionBias = Math.pow(1 - 0.1, 60);
	
	/// Number of frames that contact information should persist.
	/// Defaults to 3. There is probably never a reason to change this value.
	this.collisionPersistence = 3;
	
	/// Rebuild the contact graph during each step. Must be enabled to use the cpBodyEachArbiter() function.
	/// Disabled by default for a small performance boost. Enabled implicitly when the sleeping feature is enabled.
	this.enableContactGraph = false;
	
	/// The designated static body for this space.
	/// You can modify this body, or replace it with your own static body.
	/// By default it points to a statically allocated cpBody in the cpSpace struct.
	this.staticBody = new Body(Infinity, Infinity);
	this.staticBody.nodeIdleTime = Infinity;

	// Cache the collideShapes callback function for the space.
	this.collideShapes = this.makeCollideShapes();
};

/// returns true from inside a callback and objects cannot be added/removed.
Space.prototype.isLocked = function()
{
	return this.locked;
};

var assertSpaceUnlocked = function(space)
{
	assert(!space.locked, "This addition/removal cannot be done safely during a call to cpSpaceStep() \
 or during a query. Put these calls into a post-step callback.");
};

// **** Collision handler function management

/// Set a collision handler to be used whenever the two shapes with the given collision types collide.
/// You can pass null for any function you don't want to implement.
Space.prototype.addCollisionHandler = function(a, b, begin, preSolve, postSolve, separate)
{
	assertSpaceUnlocked(this);
		
	// Remove any old function so the new one will get added.
	this.removeCollisionHandler(a, b);
	
	var handler = new CollisionHandler();
	handler.a = a;
	handler.b = b;
	if(begin) handler.begin = begin;
	if(preSolve) handler.preSolve = preSolve;
	if(postSolve) handler.postSolve = postSolve;
	if(separate) handler.separate = separate;

	this.collisionHandlers[hashPair(a, b)] = handler;
};

/// Unset a collision handler.
Space.prototype.removeCollisionHandler = function(a, b)
{
	assertSpaceUnlocked(this);
	
	delete this.collisionHandlers[hashPair(a, b)];
};

/// Set a default collision handler for this space.
/// The default collision handler is invoked for each colliding pair of shapes
/// that isn't explicitly handled by a specific collision handler.
/// You can pass null for any function you don't want to implement.
Space.prototype.setDefaultCollisionHandler = function(begin, preSolve, postSolve, separate)
{
	assertSpaceUnlocked(this);

	var handler = new CollisionHandler();
	if(begin) handler.begin = begin;
	if(preSolve) handler.preSolve = preSolve;
	if(postSolve) handler.postSolve = postSolve;
	if(separate) handler.separate = separate;

	this.defaultHandler = handler;
};

Space.prototype.lookupHandler = function(a, b)
{
	return this.collisionHandlers[hashPair(a, b)] || this.defaultHandler;
};

// **** Body, Shape, and Joint Management

/// Add a collision shape to the simulation.
/// If the shape is attached to a static body, it will be added as a static shape.
Space.prototype.addShape = function(shape)
{
	var body = shape.body;
	if(body.isStatic()) return this.addStaticShape(shape);
	
	assert(!shape.space, "This shape is already added to a space and cannot be added to another.");
	assertSpaceUnlocked(this);
	
	body.activate();
	body.addShape(shape);
	
	shape.update(body.p, body.rot);
	this.activeShapes.insert(shape, shape.hashid);
	shape.space = this;
		
	return shape;
};

/// Explicity add a shape as a static shape to the simulation.
Space.prototype.addStaticShape = function(shape)
{
	assert(!shape.space, "This shape is already added to a space and cannot be added to another.");
	assertSpaceUnlocked(this);
	
	var body = shape.body;
	body.addShape(shape);

	shape.update(body.p, body.rot);
	this.staticShapes.insert(shape, shape.hashid);
	shape.space = this;
	
	return shape;
};

/// Add a rigid body to the simulation.
Space.prototype.addBody = function(body)
{
	assert(!body.isStatic(), "Static bodies cannot be added to a space as they are not meant to be simulated.");
	assert(!body.space, "This body is already added to a space and cannot be added to another.");
	assertSpaceUnlocked(this);
	
	this.bodies.push(body);
	body.space = this;
	
	return body;
};

/// Add a constraint to the simulation.
Space.prototype.addConstraint = function(constraint)
{
	assert(!constraint.space, "This shape is already added to a space and cannot be added to another.");
	assertSpaceUnlocked(this);
	
	var a = constraint.a, b = constraint.b;

	a.activate();
	b.activate();
	this.constraints.push(constraint);
	
	// Push onto the heads of the bodies' constraint lists
	constraint.next_a = a.constraintList; a.constraintList = constraint;
	constraint.next_b = b.constraintList; b.constraintList = constraint;
	constraint.space = this;
	
	return constraint;
};

Space.prototype.filterArbiters = function(body, filter)
{
	for (var hash in this.cachedArbiters)
	{
		var arb = this.cachedArbiters[hash];

		// Match on the filter shape, or if it's null the filter body
		if(
			(body === arb.body_a && (filter === arb.a || filter === null)) ||
			(body === arb.body_b && (filter === arb.b || filter === null))
		){
			// Call separate when removing shapes.
			if(filter && arb.state !== 'cached') arb.callSeparate(this);
			
			arb.unthread();

			deleteObjFromList(this.arbiters, arb);
			//this.pooledArbiters.push(arb);
			
			delete this.cachedArbiters[hash];
		}
	}
};

/// Remove a collision shape from the simulation.
Space.prototype.removeShape = function(shape)
{
	var body = shape.body;
	if(body.isStatic()){
		this.removeStaticShape(shape);
	} else {
		assert(this.containsShape(shape),
			"Cannot remove a shape that was not added to the space. (Removed twice maybe?)");
		assertSpaceUnlocked(this);
		
		body.activate();
		body.removeShape(shape);
		this.filterArbiters(body, shape);
		this.activeShapes.remove(shape, shape.hashid);
		shape.space = null;
	}
};

/// Remove a collision shape added using addStaticShape() from the simulation.
Space.prototype.removeStaticShape = function(shape)
{
	assert(this.containsShape(shape),
		"Cannot remove a static or sleeping shape that was not added to the space. (Removed twice maybe?)");
	assertSpaceUnlocked(this);
	
	var body = shape.body;
	if(body.isStatic()) body.activateStatic(shape);
	body.removeShape(shape);
	this.filterArbiters(body, shape);
	this.staticShapes.remove(shape, shape.hashid);
	shape.space = null;
};

/// Remove a rigid body from the simulation.
Space.prototype.removeBody = function(body)
{
	assert(this.containsBody(body),
		"Cannot remove a body that was not added to the space. (Removed twice maybe?)");
	assertSpaceUnlocked(this);
	
	body.activate();
//	this.filterArbiters(body, null);
	deleteObjFromList(this.bodies, body);
	body.space = null;
};

/// Remove a constraint from the simulation.
Space.prototype.removeConstraint = function(constraint)
{
	assert(this.containsConstraint(constraint),
		"Cannot remove a constraint that was not added to the space. (Removed twice maybe?)");
	assertSpaceUnlocked(this);
	
	constraint.a.activate();
	constraint.b.activate();
	deleteObjFromList(this.constraints, constraint);
	
	constraint.a.removeConstraint(constraint);
	constraint.b.removeConstraint(constraint);
	constraint.space = null;
};

/// Test if a collision shape has been added to the space.
Space.prototype.containsShape = function(shape)
{
	return (shape.space === this);
};

/// Test if a rigid body has been added to the space.
Space.prototype.containsBody = function(body)
{
	return (body.space == this);
};

/// Test if a constraint has been added to the space.
Space.prototype.containsConstraint = function(constraint)
{
	return (constraint.space == this);
};

Space.prototype.uncacheArbiter = function(arb)
{
	delete this.cachedArbiters[hashPair(arb.a.hashid, arb.b.hashid)];
	deleteObjFromList(this.arbiters, arb);
};


// **** Iteration

/// Call @c func for each body in the space.
Space.prototype.eachBody = function(func)
{
	this.lock(); {
		var bodies = this.bodies;
		
		for(var i=0; i<bodies.length; i++){
			func(bodies[i]);
		}
		
		var components = this.sleepingComponents;
		for(var i=0; i<components.length; i++){
			var root = components[i];
			
			var body = root;
			while(body){
				var next = body.nodeNext;
				func(body);
				body = next;
			}
		}
	} this.unlock(true);
};

/// Call @c func for each shape in the space.
Space.prototype.eachShape = function(func)
{
	this.lock(); {
		this.activeShapes.each(func);
		this.staticShapes.each(func);
	} this.unlock(true);
};

/// Call @c func for each shape in the space.
Space.prototype.eachConstraint = function(func)
{
	this.lock(); {
		var constraints = this.constraints;
		
		for(var i=0; i<constraints.length; i++){
			func(constraints[i]);
		}
	} this.unlock(true);
};

// **** Spatial Index Management

/// Update the collision detection info for the static shapes in the space.
Space.prototype.reindexStatic = function()
{
	assert(!this.locked, "You cannot manually reindex objects while the space is locked. Wait until the current query or step is complete.");
	
	this.staticShapes.each(function(shape){
		var body = shape.body;
		shape.update(body.p, body.rot);
	});
	this.staticShapes.reindex();
};

/// Update the collision detection data for a specific shape in the space.
Space.prototype.reindexShape = function(shape)
{
	assert(!this.locked, "You cannot manually reindex objects while the space is locked. Wait until the current query or step is complete.");
	
	var body = shape.body;
	shape.update(body.p, body.rot);
	
	// attempt to rehash the shape in both hashes
	this.activeShapes.reindexObject(shape, shape.hashid);
	this.staticShapes.reindexObject(shape, shape.hashid);
};

/// Update the collision detection data for all shapes attached to a body.
Space.prototype.reindexShapesForBody = function(body)
{
	for(var shape = body.shapeList; shape; shape = shape.next){
		this.reindexShape(shape);
	}
};

/// Switch the space to use a spatial has as it's spatial index.
Space.prototype.useSpatialHash = function(dim, count)
{
	throw new Error('Spatial Hash not yet implemented!');
	
	var staticShapes = new SpaceHash(dim, count, null);
	var activeShapes = new SpaceHash(dim, count, staticShapes);
	
	this.staticShapes.each(function(shape){
		staticShapes.insert(shape, shape.hashid);
	});
	this.activeShapes.each(function(shape){
		activeShapes.insert(shape, shape.hashid);
	});
		
	this.staticShapes = staticShapes;
	this.activeShapes = activeShapes;
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
/// **** Sleeping Functions

Space.prototype.activateBody = function(body)
{
	assert(!body.isRogue(), "Internal error: Attempting to activate a rogue body.");
	
	if(this.locked){
		// cpSpaceActivateBody() is called again once the space is unlocked
		if(this.rousedBodies.indexOf(body) === -1) this.rousedBodies.push(body);
	} else {
		this.bodies.push(body);

		for(var i = 0; i < body.shapeList.length; i++){
			var shape = body.shapeList[i];
			this.staticShapes.remove(shape, shape.hashid);
			this.activeShapes.insert(shape, shape.hashid);
		}
		
		for(var arb = body.arbiterList; arb; arb = arb.next(body)){
			var bodyA = arb.body_a;
			if(body === bodyA || bodyA.isStatic()){
				//var contacts = arb.contacts;
				
				// Restore contact values back to the space's contact buffer memory
				//arb.contacts = cpContactBufferGetArray(this);
				//memcpy(arb.contacts, contacts, numContacts*sizeof(cpContact));
				//cpSpacePushContacts(this, numContacts);
				
				// Reinsert the arbiter into the arbiter cache
				var a = arb.a, b = arb.b;
				this.cachedArbiters[hashPair(a.hashid, b.hashid)] = arb;
				
				// Update the arbiter's state
				arb.stamp = this.stamp;
				arb.handler = this.lookupHandler(a.collision_type, b.collision_type);
				this.arbiters.push(arb);
			}
		}
		
		for(var constraint = body.constraintList; constraint; constraint = constraint.nodeNext){
			var bodyA = constraint.a;
			if(body === bodyA || bodyA.isStatic()) this.constraints.push(constraint);
		}
	}
};

Space.prototype.deactivateBody = function(body)
{
	assert(!body.isRogue(), "Internal error: Attempting to deactivate a rogue body.");
	
	deleteObjFromList(this.bodies, body);
	
	for(var i = 0; i < body.shapeList.length; i++){
		var shape = body.shapeList[i];
		this.activeShapes.remove(shape, shape.hashid);
		this.staticShapes.insert(shape, shape.hashid);
	}
	
	for(var arb = body.arbiterList; arb; arb = arb.next(body)){
		var bodyA = arb.body_a;
		if(body === bodyA || bodyA.isStatic()){
			this.uncacheArbiter(arb);
			
			// Save contact values to a new block of memory so they won't time out
			//size_t bytes = arb.numContacts*sizeof(cpContact);
			//cpContact *contacts = (cpContact *)cpcalloc(1, bytes);
			//memcpy(contacts, arb.contacts, bytes);
			//arb.contacts = contacts;
		}
	}
		
	for(var constraint = body.constraintList; constraint; constraint = constraint.nodeNext){
		var bodyA = constraint.a;
		if(body === bodyA || bodyA.isStatic()) deleteObjFromList(this.constraints, constraint);
	}
};

var componentRoot = function(body)
{
	return (body ? body.nodeRoot : null);
};

var componentActivate = function(root)
{
	if(!root || !root.isSleeping(root)) return;
	assert(!root.isRogue(), "Internal Error: componentActivate() called on a rogue body.");
	
	var space = root.space;
	var body = root;
	while(body){
		var next = body.nodeNext;
		
		body.nodeIdleTime = 0;
		body.nodeRoot = null;
		body.nodeNext = null;
		space.activateBody(body);
		
		body = next;
	}
	
	deleteObjFromList(space.sleepingComponents, root);
};

Body.prototype.activate = function()
{
	if(!this.isRogue()){
		this.nodeIdleTime = 0;
		componentActivate(componentRoot(this));
	}
};

Body.prototype.activateStatic = function(filter)
{
	assert(body.isStatic(this), "Body.activateStatic() called on a non-static body.");
	
	for(var arb = this.arbiterList; arb; arb = arb.next(this)){
		if(!filter || filter == arb.a || filter == arb.b){
			(arb.body_a == this ? arb.body_b : arb.body_a).activate();
		}
	}
	
	// TODO should also activate joints!
};

Body.prototype.pushArbiter = function(arb)
{
	assertSoft((arb.body_a === this ? arb.thread_a_next : arb.thread_b_next) === null,
		"Internal Error: Dangling contact graph pointers detected. (A)");
	assertSoft((arb.body_a === this ? arb.thread_a_prev : arb.thread_b_prev) === null,
		"Internal Error: Dangling contact graph pointers detected. (B)");
	
	var next = this.arbiterList;
	assertSoft(next === null || (next.body_a === this ? next.thread_a_prev : next.thread_b_prev) === null,
		"Internal Error: Dangling contact graph pointers detected. (C)");

	if(arb.body_a === this){
		arb.thread_a_next = next;
	} else {
		arb.thread_b_next = next;
	}

	if(next){
		if (next.body_a === this){
			next.thread_a_prev = arb;
		} else {
			next.thread_b_prev = arb;
		}
	}
	this.arbiterList = arb;
};

var componentAdd = function(root, body){
	body.nodeRoot = root;

	if(body !== root){
		body.nodeNext = root.nodeNext;
		root.nodeNext = body;
	}
};

var floodFillComponent = function(root, body)
{
	// Rogue bodies cannot be put to sleep and prevent bodies they are touching from sleeping anyway.
	// Static bodies (which are a type of rogue body) are effectively sleeping all the time.
	if(!body.isRogue()){
		var other_root = componentRoot(body);
		if(other_root == null){
			componentAdd(root, body);
			for(var arb = body.arbiterList; arb; arb = arb.next(body)){
				floodFillComponent(root, (body == arb.body_a ? arb.body_b : arb.body_a));
			}
			for(var constraint = body.constraintList; constraint; constraint = constraint.next(body)){
				floodFillComponent(root, (body == constraint.a ? constraint.b : constraint.a));
			}
		} else {
			assertSoft(other_root === root, "Internal Error: Inconsistency detected in the contact graph.");
		}
	}
};

var componentActive = function(root, threshold)
{
	for(var body = root; body; body = body.nodeNext){
		if(body.nodeIdleTime < threshold) return true;
	}
	
	return false;
};

Space.prototype.processComponents = function(dt)
{
	var sleep = (this.sleepTimeThreshold !== Infinity);
	var bodies = this.bodies;

	// These checks can be removed at some stage (if DEBUG == undefined)
	for(var i=0; i<bodies.length; i++){
		var body = bodies[i];
		
		assertSoft(body.nodeNext === null, "Internal Error: Dangling next pointer detected in contact graph.");
		assertSoft(body.nodeRoot === null, "Internal Error: Dangling root pointer detected in contact graph.");
	}

	if(sleep){
		var dv = this.idleSpeedThreshold;
		var dvsq = (dv ? dv*dv : vlengthsq(this.gravity)*dt*dt);
	
		for(var i=0; i<bodies.length; i++){
			var body = bodies[i];

			// Need to deal with infinite mass objects
			var keThreshold = (dvsq ? body.m*dvsq : 0);
			body.nodeIdleTime = (body.kineticEnergy() > keThreshold ? 0 : body.nodeIdleTime + dt);
		}
	}

	// Awaken any sleeping bodies found and then push arbiters to the bodies' lists.
	var arbiters = this.arbiters;
	for(var i=0, count=arbiters.length; i<count; i++){
		var arb = arbiters[i];
		var a = arb.body_a, b = arb.body_b;
	
		if(sleep){	
			if((b.isRogue() && !b.isStatic()) || a.isSleeping()) a.activate();
			if((a.isRogue() && !a.isStatic()) || b.isSleeping()) b.activate();
		}
		
		a.pushArbiter(arb);
		b.pushArbiter(arb);
	}
	
	if(sleep){
		// Bodies should be held active if connected by a joint to a non-static rouge body.
		var constraints = this.constraints;
		for(var i=0; i<constraints.length; i++){
			var constraint = constraints[i];
			var a = constraint.a, b = constraint.b;
			
			if(b.isRogue() && !b.isStatic()) a.activate();
			if(a.isRogue() && !a.isStatic()) b.activate();
		}
		
		// Generate components and deactivate sleeping ones
		for(var i=0; i<bodies.length;){
			var body = bodies[i];
			
			if(componentRoot(body) === null){
				// Body not in a component yet. Perform a DFS to flood fill mark 
				// the component in the contact graph using this body as the root.
				floodFillComponent(body, body);
				
				// Check if the component should be put to sleep.
				if(!componentActive(body, this.sleepTimeThreshold)){
					this.sleepingComponents.push(body);
					for(var other = body; other; other = other.nodeNext){
						this.deactivateBody(other);
					}
					
					// deactivateBody() removed the current body from the list.
					// Skip incrementing the index counter.
					continue;
				}
			}
			
			i++;
			
			// Only sleeping bodies retain their component node pointers.
			body.nodeRoot = null;
			body.nodeNext = null;
		}
	}
};

Body.prototype.sleep = function()
{
	this.sleepWithGroup(null);
};

Body.prototype.sleepWithGroup = function(group){
	assert(!this.isStatic() && !this.isRogue(), "Rogue and static bodies cannot be put to sleep.");
	
	var space = this.space;
	assert(space, "Cannot put a rogue body to sleep.");
	assert(!space.locked, "Bodies cannot be put to sleep during a query or a call to cpSpaceStep(). Put these calls into a post-step callback.");
	assert(group === null || group.isSleeping(), "Cannot use a non-sleeping body as a group identifier.");
	
	if(this.isSleeping()){
		assert(componentRoot(this) === componentRoot(group), "The body is already sleeping and it's group cannot be reassigned.");
		return;
	}
	
	for(var i = 0; i < body.shapeList.length; i++){
		body.shapeList.update(this.p, this.rot);
	}
	space.deactivateBody(this);
	
	if(group){
		var root = componentRoot(group);
		
		this.nodeRoot = root;
		this.nodeNext = root.nodeNext;
		this.nodeIdleTime = 0;
		
		root.nodeNext = this;
	} else {
		this.nodeRoot = this;
		this.nodeNext = null;
		this.nodeIdleTime = 0;
		
		space.sleepingComponents.push(this);
	}
	
	deleteObjFromList(space.bodies, this);
};

Space.prototype.activateShapesTouchingShape = function(shape){
	if(this.sleepTimeThreshold !== Infinity){
		this.shapeQuery(shape, function(shape, points) {
			shape.body.activate();
		});
	}
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// Query the space at a point and call @c func for each shape found.
Space.prototype.pointQuery = function(point, layers, group, func)
{
	var helper = function(shape){
		if(
			!(shape.group && group === shape.group) && (layers & shape.layers) &&
			shape.pointQuery(point)
		){
			func(shape);
		}
	};

	this.lock(); {
		this.activeShapes.pointQuery(point, helper);
		this.staticShapes.pointQuery(point, helper);
	} this.unlock(true);
};

/// Query the space at a point and return the first shape found. Returns null if no shapes were found.
Space.prototype.pointQueryFirst = function(point, layers, group)
{
	var outShape = null;
	this.pointQuery(point, layers, group, function(shape) {
		if(!shape.sensor) outShape = shape;
	});
	
	return outShape;
};

/// Perform a directed line segment query (like a raycast) against the space calling @c func for each shape intersected.
Space.prototype.segmentQuery = function(start, end, layers, group, func)
{
	var helper = function(shape){
		var info;
		
		if(
			!(shape.group && group === shape.group) && (layers & shape.layers) &&
			(info = shape.segmentQuery(start, end))
		){
			func(shape, info.t, info.n);
		}
		
		return 1;
	};

	this.lock(); {
		this.staticShapes.segmentQuery(start, end, 1, helper);
		this.activeShapes.segmentQuery(start, end, 1, helper);
	} this.unlock(true);
};

/// Perform a directed line segment query (like a raycast) against the space and return the first shape hit.
/// Returns null if no shapes were hit.
Space.prototype.segmentQueryFirst = function(start, end, layers, group)
{
	var out = null;

	var helper = function(shape){
		var info;
		
		if(
			!(shape.group && group === shape.group) && (layers & shape.layers) &&
			!shape.sensor &&
			(info = shape.segmentQuery(start, end)) &&
			(out === null || info.t < out.t)
		){
			out = info;
		}
		
		return out ? out.t : 1;
	};

	this.staticShapes.segmentQuery(start, end, 1, helper);
	this.activeShapes.segmentQuery(start, end, out ? out.t : 1, helper);
	
	return out;
};

/// Perform a fast rectangle query on the space calling @c func for each shape found.
/// Only the shape's bounding boxes are checked for overlap, not their full shape.
Space.prototype.bbQuery = function(bb, layers, group, func)
{
	var helper = function(shape){
		if(
			!(shape.group && group === shape.group) && (layers & shape.layers) &&
			bbIntersects2(bb, shape.bb_l, shape.bb_b, shape.bb_r, shape.bb_t)
		){
			func(shape);
		}
	};
	
	this.lock(); {
		this.activeShapes.query(bb, helper);
		this.staticShapes.query(bb, helper);
	} this.unlock(true);
};

/// Query a space for any shapes overlapping the given shape and call @c func for each shape found.
Space.prototype.shapeQuery = function(shape, func)
{
	var body = shape.body;

	//var bb = (body ? shape.update(body.p, body.rot) : shape.bb);
	if(body){
		shape.update(body.p, body.rot);
	}
	var bb = new BB(shape.bb_l, shape.bb_b, shape.bb_r, shape.bb_t);

	//shapeQueryContext context = {func, data, false};
	var anyCollision = false;
	
	var helper = function(b){
		var a = shape;
		// Reject any of the simple cases
		if(
			(a.group && a.group === b.group) ||
			!(a.layers & b.layers) ||
			a === b
		) return;
		
		var contacts;
		
		// Shape 'a' should have the lower shape type. (required by cpCollideShapes() )
		if(a.collisionCode <= b.collisionCode){
			contacts = cpCollideShapes(a, b);
		} else {
			contacts = cpCollideShapes(b, a);
			for(var i=0; i<contacts.length; i++) contacts[i].n = vneg(contacts[i].n);
		}
		
		if(contacts.length){
			anyCollision = !(a.sensor || b.sensor);
			
			if(func){
				var set = new Array(contacts.length);
				for(var i=0; i<contacts.length; i++){
					set[i] = new ContactPoint(contacts[i].p, contacts[i].n, contacts[i].dist);
				}
				
				func(b, set);
			}
		}
	};

	this.lock(); {
		this.activeShapes.query(bb, helper);
		this.staticShapes.query(bb, helper);
	} this.unlock(true);
	
	return anyCollision;
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
// **** Post Step Callback Functions

/// Schedule a post-step callback to be called when cpSpaceStep() finishes.
Space.prototype.addPostStepCallback = function(func)
{
	assertWarn(this.locked,
		"Adding a post-step callback when the space is not locked is unnecessary. " +
		"Post-step callbacks will not called until the end of the next call to cpSpaceStep() or the next query.");
	
	this.postStepCallbacks.push(func);
};

Space.prototype.runPostStepCallbacks = function()
{
	// Don't cache length because post step callbacks may add more post step callbacks
	// directly or indirectly.
	for(var i = 0; i < this.postStepCallbacks.length; i++){
		this.postStepCallbacks[i]();
	}
};

// **** Locking Functions

Space.prototype.lock = function()
{
	this.locked++;
};

Space.prototype.unlock = function(runPostStep)
{
	this.locked--;
	assert(this.locked >= 0, "Internal Error: Space lock underflow.");
	
	if(!this.locked && runPostStep){
		var waking = this.rousedBodies;
		for(var i=0; i<waking.length; i++){
			this.activateBody(waking[i]);
		}
		
		waking.length = 0;
		
		this.runPostStepCallbacks();
	}
};

// **** Contact Buffer Functions

/* josephg:
 *
 * This code might be faster in JS than just allocating objects each time - I'm
 * really not sure. If the contact buffer solution is used, there will also
 * need to be changes in cpCollision.js to fill a passed array instead of creating
 * new arrays each time.
 *
 * TODO: Benchmark me once chipmunk is working.
 */

/*
var ContactBuffer = function(stamp, splice)
{
	this.stamp = stamp;
	// Contact buffers are a circular linked list.
	this.next = splice ? splice.next : this;
	this.contacts = [];
};

Space.prototype.pushFreshContactBuffer = function()
{
	var stamp = this.stamp;
	
	var head = this.contactBuffersHead;
	
	if(!head){
		// No buffers have been allocated, make one
		this.contactBuffersHead = new ContactBuffer(stamp, null);
	} else if(stamp - head.next.stamp > this.collisionPersistence){
		// The tail buffer is available, rotate the ring
		var tail = head.next;
		tail.stamp = stamp;
		tail.contacts.length = 0;
		this.contactBuffersHead = tail;
	} else {
		// Allocate a new buffer and push it into the ring
		var buffer = new ContactBuffer(stamp, head);
		this.contactBuffersHead = head.next = buffer;
	}
};

cpContact *
cpContactBufferGetArray(cpSpace *space)
{
	if(space.contactBuffersHead.numContacts + CP_MAX_CONTACTS_PER_ARBITER > CP_CONTACTS_BUFFER_SIZE){
		// contact buffer could overflow on the next collision, push a fresh one.
		space.pushFreshContactBuffer();
	}
	
	cpContactBufferHeader *head = space.contactBuffersHead;
	return ((cpContactBuffer *)head)->contacts + head.numContacts;
}

void
cpSpacePushContacts(cpSpace *space, int count)
{
	cpAssertHard(count <= CP_MAX_CONTACTS_PER_ARBITER, "Internal Error: Contact buffer overflow!");
	space.contactBuffersHead.numContacts += count;
}

static void
cpSpacePopContacts(cpSpace *space, int count){
	space.contactBuffersHead.numContacts -= count;
}
*/

// **** Collision Detection Functions

/* Use this to re-enable object pools.
static void *
cpSpaceArbiterSetTrans(cpShape **shapes, cpSpace *space)
{
	if(space.pooledArbiters.num == 0){
		// arbiter pool is exhausted, make more
		int count = CP_BUFFER_BYTES/sizeof(cpArbiter);
		cpAssertHard(count, "Internal Error: Buffer size too small.");
		
		cpArbiter *buffer = (cpArbiter *)cpcalloc(1, CP_BUFFER_BYTES);
		cpArrayPush(space.allocatedBuffers, buffer);
		
		for(int i=0; i<count; i++) cpArrayPush(space.pooledArbiters, buffer + i);
	}
	
	return cpArbiterInit((cpArbiter *)cpArrayPop(space.pooledArbiters), shapes[0], shapes[1]);
}*/

// Callback from the spatial hash.
Space.prototype.makeCollideShapes = function()
{
	// It would be nicer to use .bind() or something, but this is faster.
	var space_ = this;
	return function(a, b){
		var space = space_;

		// Reject any of the simple cases
		if(
			// BBoxes must overlap
			//!bbIntersects(a.bb, b.bb)
			!(a.bb_l <= b.bb_r && b.bb_l <= a.bb_r && a.bb_b <= b.bb_t && b.bb_b <= a.bb_t)
			// Don't collide shapes attached to the same body.
			|| a.body === b.body
			// Don't collide objects in the same non-zero group
			|| (a.group && a.group === b.group)
			// Don't collide objects that don't share at least on layer.
			|| !(a.layers & b.layers)
		) return;
		
		var handler = space.lookupHandler(a.collision_type, b.collision_type);
		
		var sensor = a.sensor || b.sensor;
		if(sensor && handler === defaultCollisionHandler) return;
		
		// Shape 'a' should have the lower shape type. (required by cpCollideShapes() )
		if(a.collisionCode > b.collisionCode){
			var temp = a;
			a = b;
			b = temp;
		}
		
		// Narrow-phase collision detection.
		//cpContact *contacts = cpContactBufferGetArray(space);
		//int numContacts = cpCollideShapes(a, b, contacts);
		var contacts = collideShapes(a, b);
		if(contacts.length === 0) return; // Shapes are not colliding.
		//cpSpacePushContacts(space, numContacts);
		
		// Get an arbiter from space.arbiterSet for the two shapes.
		// This is where the persistant contact magic comes from.
		var arbHash = hashPair(a.hashid, b.hashid);
		var arb = space.cachedArbiters[arbHash];
		if (!arb){
			arb = space.cachedArbiters[arbHash] = new Arbiter(a, b);
		}

		arb.update(contacts, handler, a, b);
		
		// Call the begin function first if it's the first step
		if(arb.state == 'first coll' && !handler.begin(arb, space)){
			arb.ignore(); // permanently ignore the collision until separation
		}
		
		if(
			// Ignore the arbiter if it has been flagged
			(arb.state !== 'ignore') && 
			// Call preSolve
			handler.preSolve(arb, space) &&
			// Process, but don't add collisions for sensors.
			!sensor
		){
			space.arbiters.push(arb);
		} else {
			//cpSpacePopContacts(space, numContacts);
			
			arb.contacts = null;
			
			// Normally arbiters are set as used after calling the post-solve callback.
			// However, post-solve callbacks are not called for sensors or arbiters rejected from pre-solve.
			if(arb.state !== 'ignore') arb.state = 'normal';
		}
		
		// Time stamp the arbiter so we know it was used recently.
		arb.stamp = space.stamp;
	};
};

// Hashset filter func to throw away old arbiters.
Space.prototype.arbiterSetFilter = function(arb)
{
	var ticks = this.stamp - arb.stamp;
	
	var a = arb.body_a, b = arb.body_b;
	
	// TODO should make an arbiter state for this so it doesn't require filtering arbiters for
	// dangling body pointers on body removal.
	// Preserve arbiters on sensors and rejected arbiters for sleeping objects.
	// This prevents errant separate callbacks from happenening.
	if(
		(a.isStatic() || a.isSleeping()) &&
		(b.isStatic() || b.isSleeping())
	){
		return true;
	}
	
	// Arbiter was used last frame, but not this one
	if(ticks >= 1 && arb.state != 'cached'){
		arb.callSeparate(this);
		arb.state = 'cached';
	}
	
	if(ticks >= this.collisionPersistence){
		arb.contacts = null;
		
		//cpArrayPush(this.pooledArbiters, arb);
		return false;
	}
	
	return true;
};

// **** All Important cpSpaceStep() Function

var updateFunc = function(shape)
{
	var body = shape.body;
	shape.update(body.p, body.rot);
};

/// Step the space forward in time by @c dt.
Space.prototype.step = function(dt)
{
	// don't step if the timestep is 0!
	if(dt === 0) return;

	assert(vzero.x === 0 && vzero.y === 0, "vzero is invalid");
	
	this.stamp++;
	
	var prev_dt = this.curr_dt;
	this.curr_dt = dt;
		
	var bodies = this.bodies;
	var constraints = this.constraints;
	var arbiters = this.arbiters;
	
	// Reset and empty the arbiter lists.
	for(var i=0; i<arbiters.length; i++){
		var arb = arbiters[i];
		arb.state = 'normal';
		
		// If both bodies are awake, unthread the arbiter from the contact graph.
		if(!arb.body_a.isSleeping() && !arb.body_b.isSleeping()){
			arb.unthread();
		}
	}
	arbiters.length = 0;

	this.lock(); {
		// Integrate positions
		for(var i=0; i<bodies.length; i++){
			var body = bodies[i];
			body.position_func(dt);
		}
		
		// Find colliding pairs.
		//this.pushFreshContactBuffer();
		this.activeShapes.each(updateFunc);
		this.activeShapes.reindexQuery(this.collideShapes);
	} this.unlock(false);
	
	// Rebuild the contact graph (and detect sleeping components if sleeping is enabled)
	this.processComponents(dt);
	
	this.lock(); {
		// Clear out old cached arbiters and call separate callbacks
		for(var hash in this.cachedArbiters) {
			if(!this.arbiterSetFilter(this.cachedArbiters[hash])) {
				delete this.cachedArbiters[hash];
			}
		}

		// Prestep the arbiters and constraints.
		var slop = this.collisionSlop;
		var biasCoef = 1 - Math.pow(this.collisionBias, dt);
		for(var i=0; i<arbiters.length; i++){
			arbiters[i].preStep(dt, slop, biasCoef);
		}

		for(var i=0; i<constraints.length; i++){
			var constraint = constraints[i];
			
			constraint.preSolve(this);
			constraint.preStep(dt);
		}
	
		// Integrate velocities.
		var damping = Math.pow(this.damping, dt);
		var gravity = this.gravity;
		for(var i=0; i<bodies.length; i++){
			var body = bodies[i];
			body.velocity_func(gravity, damping, dt);
		}
		
		// Apply cached impulses
		var dt_coef = (prev_dt === 0 ? 0 : dt/prev_dt);
		for(var i=0; i<arbiters.length; i++){
			arbiters[i].applyCachedImpulse(dt_coef);
		}
		
		for(var i=0; i<constraints.length; i++){
			var constraint = constraints[i];
			constraint.applyCachedImpulse(dt_coef);
		}
		
		// Run the impulse solver.
		//cpSpaceArbiterApplyImpulseFunc applyImpulse = this.arbiterApplyImpulse;
		for(var i=0; i<this.iterations; i++){
			for(var j=0; j<arbiters.length; j++){
				arbiters[j].applyImpulse();
			}
				
			for(var j=0; j<constraints.length; j++){
				constraints[j].applyImpulse();
			}
		}
		
		// Run the constraint post-solve callbacks
		for(var i=0; i<constraints.length; i++){
			constraints[i].postSolve(this);
		}
		
		// run the post-solve callbacks
		for(var i=0; i<arbiters.length; i++){
			var arb = arbiters[i];

			arb.handler.postSolve(arb, this);
		}
	} this.unlock(true);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// These are utility routines to use when creating custom constraints.
// I'm not sure if this should be part of the private API or not.
// I should probably clean up the naming conventions if it is...

//#define J_MAX(constraint, dt) (((cpConstraint *)constraint)->maxForce*(dt))

// a and b are bodies.
var relative_velocity = function(a, b, r1, r2){
	//var v1_sum = vadd(a.v, vmult(vperp(r1), a.w));
	var v1_sumx = a.vx + (-r1.y) * a.w;
	var v1_sumy = a.vy + ( r1.x) * a.w;

	//var v2_sum = vadd(b.v, vmult(vperp(r2), b.w));
	var v2_sumx = b.vx + (-r2.y) * b.w;
	var v2_sumy = b.vy + ( r2.x) * b.w;
	
//	return vsub(v2_sum, v1_sum);
	return new Vect(v2_sumx - v1_sumx, v2_sumy - v1_sumy);
};

var normal_relative_velocity = function(a, b, r1, r2, n){
	//return vdot(relative_velocity(a, b, r1, r2), n);
	var v1_sumx = a.vx + (-r1.y) * a.w;
	var v1_sumy = a.vy + ( r1.x) * a.w;
	var v2_sumx = b.vx + (-r2.y) * b.w;
	var v2_sumy = b.vy + ( r2.x) * b.w;

	return vdot2(v2_sumx - v1_sumx, v2_sumy - v1_sumy, n.x, n.y);
};

/*
var apply_impulse = function(body, j, r){
	body.v = vadd(body.v, vmult(j, body.m_inv));
	body.w += body.i_inv*vcross(r, j);
};

var apply_impulses = function(a, b, r1, r2, j)
{
	apply_impulse(a, vneg(j), r1);
	apply_impulse(b, j, r2);
};
*/

var apply_impulse = function(body, jx, jy, r){
//	body.v = body.v.add(vmult(j, body.m_inv));
	body.vx += jx * body.m_inv;
	body.vy += jy * body.m_inv;
//	body.w += body.i_inv*vcross(r, j);
	body.w += body.i_inv*(r.x*jy - r.y*jx);
};

var apply_impulses = function(a, b, r1, r2, jx, jy)
{
	apply_impulse(a, -jx, -jy, r1);
	apply_impulse(b, jx, jy, r2);
};

var apply_bias_impulse = function(body, jx, jy, r)
{
	//body.v_bias = vadd(body.v_bias, vmult(j, body.m_inv));
	body.v_biasx += jx * body.m_inv;
	body.v_biasy += jy * body.m_inv;
	body.w_bias += body.i_inv*vcross2(r.x, r.y, jx, jy);
};

/*
var apply_bias_impulses = function(a, b, r1, r2, j)
{
	apply_bias_impulse(a, vneg(j), r1);
	apply_bias_impulse(b, j, r2);
};*/

var k_scalar_body = function(body, r, n)
{
	var rcn = vcross(r, n);
	return body.m_inv + body.i_inv*rcn*rcn;
};

var k_scalar = function(a, b, r1, r2, n)
{
	var value = k_scalar_body(a, r1, n) + k_scalar_body(b, r2, n);
	assertSoft(value !== 0, "Unsolvable collision or constraint.");
	
	return value;
};

// k1 and k2 are modified by the function to contain the outputs.
var k_tensor = function(a, b, r1, r2, k1, k2)
{
	// calculate mass matrix
	// If I wasn't lazy and wrote a proper matrix class, this wouldn't be so gross...
	var k11, k12, k21, k22;
	var m_sum = a.m_inv + b.m_inv;
	
	// start with I*m_sum
	k11 = m_sum; k12 = 0;
	k21 = 0;     k22 = m_sum;
	
	// add the influence from r1
	var a_i_inv = a.i_inv;
	var r1xsq =  r1.x * r1.x * a_i_inv;
	var r1ysq =  r1.y * r1.y * a_i_inv;
	var r1nxy = -r1.x * r1.y * a_i_inv;
	k11 += r1ysq; k12 += r1nxy;
	k21 += r1nxy; k22 += r1xsq;
	
	// add the influnce from r2
	var b_i_inv = b.i_inv;
	var r2xsq =  r2.x * r2.x * b_i_inv;
	var r2ysq =  r2.y * r2.y * b_i_inv;
	var r2nxy = -r2.x * r2.y * b_i_inv;
	k11 += r2ysq; k12 += r2nxy;
	k21 += r2nxy; k22 += r2xsq;
	
	// invert
	var determinant = k11*k22 - k12*k21;
	assertSoft(determinant !== 0, "Unsolvable constraint.");
	
	var det_inv = 1/determinant;

	k1.x =  k22*det_inv; k1.y = -k12*det_inv;
	k2.x = -k21*det_inv; k2.y =  k11*det_inv;
};

var mult_k = function(vr, k1, k2)
{
	return new Vect(vdot(vr, k1), vdot(vr, k2));
};

var bias_coef = function(errorBias, dt)
{
	return 1 - Math.pow(errorBias, dt);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// TODO: Comment me!

// a and b are bodies that the constraint applies to.
var Constraint = cp.Constraint = function(a, b)
{
	/// The first body connected to this constraint.
	this.a = a;
	/// The second body connected to this constraint.
	this.b = b;
	
	this.space = null;

	this.next_a = null;
	this.next_b = null;
	
	/// The maximum force that this constraint is allowed to use.
	this.maxForce = Infinity;
	/// The rate at which joint error is corrected.
	/// Defaults to pow(1 - 0.1, 60) meaning that it will
	/// correct 10% of the error every 1/60th of a second.
	this.errorBias = Math.pow(1 - 0.1, 60);
	/// The maximum rate at which joint error is corrected.
	this.maxBias = Infinity;
};

Constraint.prototype.activateBodies = function()
{
	if(this.a) this.a.activate();
	if(this.b) this.b.activate();
};

/// These methods are overridden by the constraint itself.
Constraint.prototype.preStep = function(dt) {};
Constraint.prototype.applyCachedImpulse = function(dt_coef) {};
Constraint.prototype.applyImpulse = function() {};
Constraint.prototype.getImpulse = function() { return 0; };

/// Function called before the solver runs. This can be overridden by the user
/// to customize the constraint.
/// Animate your joint anchors, update your motor torque, etc.
Constraint.prototype.preSolve = function(space) {};

/// Function called after the solver runs. This can be overridden by the user
/// to customize the constraint.
/// Use the applied impulse to perform effects like breakable joints.
Constraint.prototype.postSolve = function(space) {};

Constraint.prototype.next = function(body)
{
	return (this.a === body ? this.next_a : this.next_b);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var PinJoint = cp.PinJoint = function(a, b, anchr1, anchr2)
{
	Constraint.call(this, a, b);
	
	this.anchr1 = anchr1;
	this.anchr2 = anchr2;
	
	// STATIC_BODY_CHECK
	var p1 = (a ? vadd(a.p, vrotate(anchr1, a.rot)) : anchr1);
	var p2 = (b ? vadd(b.p, vrotate(anchr2, b.rot)) : anchr2);
	this.dist = vlength(vsub(p2, p1));
	
	assertSoft(this.dist > 0, "You created a 0 length pin joint. A pivot joint will be much more stable.");

	this.r1 = this.r2 = null;
	this.n = null;
	this.nMass = 0;

	this.jnAcc = this.jnMax = 0;
	this.bias = 0;
};

PinJoint.prototype = Object.create(Constraint.prototype);

PinJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	this.r1 = vrotate(this.anchr1, a.rot);
	this.r2 = vrotate(this.anchr2, b.rot);
	
	var delta = vsub(vadd(b.p, this.r2), vadd(a.p, this.r1));
	var dist = vlength(delta);
	this.n = vmult(delta, 1/(dist ? dist : Infinity));
	
	// calculate mass normal
	this.nMass = 1/k_scalar(a, b, this.r1, this.r2, this.n);
	
	// calculate bias velocity
	var maxBias = this.maxBias;
	this.bias = clamp(-bias_coef(this.errorBias, dt)*(dist - this.dist)/dt, -maxBias, maxBias);
	
	// compute max impulse
	this.jnMax = this.maxForce * dt;
};

PinJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	var j = vmult(this.n, this.jnAcc*dt_coef);
	apply_impulses(this.a, this.b, this.r1, this.r2, j.x, j.y);
};

PinJoint.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	var n = this.n;

	// compute relative velocity
	var vrn = normal_relative_velocity(a, b, this.r1, this.r2, n);
	
	// compute normal impulse
	var jn = (this.bias - vrn)*this.nMass;
	var jnOld = this.jnAcc;
	this.jnAcc = clamp(jnOld + jn, -this.jnMax, this.jnMax);
	jn = this.jnAcc - jnOld;
	
	// apply impulse
	apply_impulses(a, b, this.r1, this.r2, n.x*jn, n.y*jn);
};

PinJoint.prototype.getImpulse = function()
{
	return Math.abs(this.jnAcc);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var SlideJoint = cp.SlideJoint = function(a, b, anchr1, anchr2, min, max)
{
	Constraint.call(this, a, b);
	
	this.anchr1 = anchr1;
	this.anchr2 = anchr2;
	this.min = min;
	this.max = max;

	this.r1 = this.r2 = this.n = null;
	this.nMass = 0;
	
	this.jnAcc = this.jnMax = 0;
	this.bias = 0;
};

SlideJoint.prototype = Object.create(Constraint.prototype);

SlideJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	this.r1 = vrotate(this.anchr1, a.rot);
	this.r2 = vrotate(this.anchr2, b.rot);
	
	var delta = vsub(vadd(b.p, this.r2), vadd(a.p, this.r1));
	var dist = vlength(delta);
	var pdist = 0;
	if(dist > this.max) {
		pdist = dist - this.max;
		this.n = vnormalize_safe(delta);
	} else if(dist < this.min) {
		pdist = this.min - dist;
		this.n = vneg(vnormalize_safe(delta));
	} else {
		this.n = vzero;
		this.jnAcc = 0;
	}
	
	// calculate mass normal
	this.nMass = 1/k_scalar(a, b, this.r1, this.r2, this.n);
	
	// calculate bias velocity
	var maxBias = this.maxBias;
	this.bias = clamp(-bias_coef(this.errorBias, dt)*pdist/dt, -maxBias, maxBias);
	
	// compute max impulse
	this.jnMax = this.maxForce * dt;
};

SlideJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	var jn = this.jnAcc * dt_coef;
	apply_impulses(this.a, this.b, this.r1, this.r2, this.n.x * jn, this.n.y * jn);
};

SlideJoint.prototype.applyImpulse = function()
{
	if(this.n.x === 0 && this.n.y === 0) return;  // early exit

	var a = this.a;
	var b = this.b;
	
	var n = this.n;
	var r1 = this.r1;
	var r2 = this.r2;
		
	// compute relative velocity
	var vr = relative_velocity(a, b, r1, r2);
	var vrn = vdot(vr, n);
	
	// compute normal impulse
	var jn = (this.bias - vrn)*this.nMass;
	var jnOld = this.jnAcc;
	this.jnAcc = clamp(jnOld + jn, -this.jnMax, 0);
	jn = this.jnAcc - jnOld;
	
	// apply impulse
	apply_impulses(a, b, this.r1, this.r2, n.x * jn, n.y * jn);
};

SlideJoint.prototype.getImpulse = function()
{
	return Math.abs(this.jnAcc);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Pivot joints can also be created with (a, b, pivot);
var PivotJoint = cp.PivotJoint = function(a, b, anchr1, anchr2)
{
	Constraint.call(this, a, b);
	
	if(typeof anchr2 === 'undefined') {
		var pivot = anchr1;

		anchr1 = (a ? a.world2Local(pivot) : pivot);
		anchr2 = (b ? b.world2Local(pivot) : pivot);
	}

	this.anchr1 = anchr1;
	this.anchr2 = anchr2;

	this.r1 = this.r2 = vzero;
	
	this.k1 = new Vect(0,0); this.k2 = new Vect(0,0);

	this.jAcc = vzero;

	this.jMaxLen = 0;
	this.bias = vzero;
};

PivotJoint.prototype = Object.create(Constraint.prototype);

PivotJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	this.r1 = vrotate(this.anchr1, a.rot);
	this.r2 = vrotate(this.anchr2, b.rot);
	
	// Calculate mass tensor. Result is stored into this.k1 & this.k2.
	k_tensor(a, b, this.r1, this.r2, this.k1, this.k2);
	
	// compute max impulse
	this.jMaxLen = this.maxForce * dt;
	
	// calculate bias velocity
	var delta = vsub(vadd(b.p, this.r2), vadd(a.p, this.r1));
	this.bias = vclamp(vmult(delta, -bias_coef(this.errorBias, dt)/dt), this.maxBias);
};

PivotJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	apply_impulses(this.a, this.b, this.r1, this.r2, this.jAcc.x * dt_coef, this.jAcc.y * dt_coef);
};

PivotJoint.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	var r1 = this.r1;
	var r2 = this.r2;
		
	// compute relative velocity
	var vr = relative_velocity(a, b, r1, r2);
	
	// compute normal impulse
	var j = mult_k(vsub(this.bias, vr), this.k1, this.k2);
	var jOld = this.jAcc;
	this.jAcc = vclamp(vadd(this.jAcc, j), this.jMaxLen);
	
	// apply impulse
	apply_impulses(a, b, this.r1, this.r2, this.jAcc.x - jOld.x, this.jAcc.y - jOld.y);
};

PivotJoint.prototype.getImpulse = function()
{
	return vlength(this.jAcc);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var GrooveJoint = cp.GrooveJoint = function(a, b, groove_a, groove_b, anchr2)
{
	Constraint.call(this, a, b);
	
	this.grv_a = groove_a;
	this.grv_b = groove_b;
	this.grv_n = vperp(vnormalize(vsub(groove_b, groove_a)));
	this.anchr2 = anchr2;
	
	this.grv_tn = null;
	this.clamp = 0;
	this.r1 = this.r2 = null;

	this.k1 = new Vect(0,0);
	this.k2 = new Vect(0,0);

	this.jAcc = vzero;
	this.jMaxLen = 0;
	this.bias = null;
};

GrooveJoint.prototype = Object.create(Constraint.prototype);

GrooveJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	// calculate endpoints in worldspace
	var ta = a.local2World(this.grv_a);
	var tb = a.local2World(this.grv_b);

	// calculate axis
	var n = vrotate(this.grv_n, a.rot);
	var d = vdot(ta, n);
	
	this.grv_tn = n;
	this.r2 = vrotate(this.anchr2, b.rot);
	
	// calculate tangential distance along the axis of r2
	var td = vcross(vadd(b.p, this.r2), n);
	// calculate clamping factor and r2
	if(td <= vcross(ta, n)){
		this.clamp = 1;
		this.r1 = vsub(ta, a.p);
	} else if(td >= vcross(tb, n)){
		this.clamp = -1;
		this.r1 = vsub(tb, a.p);
	} else {
		this.clamp = 0;
		this.r1 = vsub(vadd(vmult(vperp(n), -td), vmult(n, d)), a.p);
	}
	
	// Calculate mass tensor
	k_tensor(a, b, this.r1, this.r2, this.k1, this.k2);	
	
	// compute max impulse
	this.jMaxLen = this.maxForce * dt;
	
	// calculate bias velocity
	var delta = vsub(vadd(b.p, this.r2), vadd(a.p, this.r1));
	this.bias = vclamp(vmult(delta, -bias_coef(this.errorBias, dt)/dt), this.maxBias);
};

GrooveJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	apply_impulses(this.a, this.b, this.r1, this.r2, this.jAcc.x * dt_coef, this.jAcc.y * dt_coef);
};

GrooveJoint.prototype.grooveConstrain = function(j){
	var n = this.grv_tn;
	var jClamp = (this.clamp*vcross(j, n) > 0) ? j : vproject(j, n);
	return vclamp(jClamp, this.jMaxLen);
};

GrooveJoint.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	var r1 = this.r1;
	var r2 = this.r2;
	
	// compute impulse
	var vr = relative_velocity(a, b, r1, r2);

	var j = mult_k(vsub(this.bias, vr), this.k1, this.k2);
	var jOld = this.jAcc;
	this.jAcc = this.grooveConstrain(vadd(jOld, j));
	
	// apply impulse
	apply_impulses(a, b, this.r1, this.r2, this.jAcc.x - jOld.x, this.jAcc.y - jOld.y);
};

GrooveJoint.prototype.getImpulse = function()
{
	return vlength(this.jAcc);
};

GrooveJoint.prototype.setGrooveA = function(value)
{
	this.grv_a = value;
	this.grv_n = vperp(vnormalize(vsub(this.grv_b, value)));
	
	this.activateBodies();
};

GrooveJoint.prototype.setGrooveB = function(value)
{
	this.grv_b = value;
	this.grv_n = vperp(vnormalize(vsub(value, this.grv_a)));
	
	this.activateBodies();
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var defaultSpringForce = function(spring, dist){
	return (spring.restLength - dist)*spring.stiffness;
};

var DampedSpring = cp.DampedSpring = function(a, b, anchr1, anchr2, restLength, stiffness, damping)
{
	Constraint.call(this, a, b);
	
	this.anchr1 = anchr1;
	this.anchr2 = anchr2;
	
	this.restLength = restLength;
	this.stiffness = stiffness;
	this.damping = damping;
	this.springForceFunc = defaultSpringForce;

	this.target_vrn = this.v_coef = 0;

	this.r1 = this.r2 = null;
	this.nMass = 0;
	this.n = null;
};

DampedSpring.prototype = Object.create(Constraint.prototype);

DampedSpring.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	this.r1 = vrotate(this.anchr1, a.rot);
	this.r2 = vrotate(this.anchr2, b.rot);
	
	var delta = vsub(vadd(b.p, this.r2), vadd(a.p, this.r1));
	var dist = vlength(delta);
	this.n = vmult(delta, 1/(dist ? dist : Infinity));
	
	var k = k_scalar(a, b, this.r1, this.r2, this.n);
	assertSoft(k !== 0, "Unsolvable this.");
	this.nMass = 1/k;
	
	this.target_vrn = 0;
	this.v_coef = 1 - Math.exp(-this.damping*dt*k);

	// apply this force
	var f_spring = this.springForceFunc(this, dist);
	apply_impulses(a, b, this.r1, this.r2, this.n.x * f_spring * dt, this.n.y * f_spring * dt);
};

DampedSpring.prototype.applyCachedImpulse = function(dt_coef){};

DampedSpring.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	var n = this.n;
	var r1 = this.r1;
	var r2 = this.r2;

	// compute relative velocity
	var vrn = normal_relative_velocity(a, b, r1, r2, n);
	
	// compute velocity loss from drag
	var v_damp = (this.target_vrn - vrn)*this.v_coef;
	this.target_vrn = vrn + v_damp;
	
	v_damp *= this.nMass;
	apply_impulses(a, b, this.r1, this.r2, this.n.x * v_damp, this.n.y * v_damp);
};

DampedSpring.prototype.getImpulse = function()
{
	return 0;
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var defaultSpringTorque = function(spring, relativeAngle){
	return (relativeAngle - spring.restAngle)*spring.stiffness;
}

var DampedRotarySpring = cp.DampedRotarySpring = function(a, b, restAngle, stiffness, damping)
{
	Constraint.call(this, a, b);
	
	this.restAngle = restAngle;
	this.stiffness = stiffness;
	this.damping = damping;
	this.springTorqueFunc = defaultSpringTorque;

	this.target_wrn = 0;
	this.w_coef = 0;
	this.iSum = 0;
};

DampedRotarySpring.prototype = Object.create(Constraint.prototype);

DampedRotarySpring.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	var moment = a.i_inv + b.i_inv;
	assertSoft(moment !== 0, "Unsolvable spring.");
	this.iSum = 1/moment;

	this.w_coef = 1 - Math.exp(-this.damping*dt*moment);
	this.target_wrn = 0;

	// apply this torque
	var j_spring = this.springTorqueFunc(this, a.a - b.a)*dt;
	a.w -= j_spring*a.i_inv;
	b.w += j_spring*b.i_inv;
};

// DampedRotarySpring.prototype.applyCachedImpulse = function(dt_coef){};

DampedRotarySpring.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	// compute relative velocity
	var wrn = a.w - b.w;//normal_relative_velocity(a, b, r1, r2, n) - this.target_vrn;
	
	// compute velocity loss from drag
	// not 100% certain spring is derived correctly, though it makes sense
	var w_damp = (this.target_wrn - wrn)*this.w_coef;
	this.target_wrn = wrn + w_damp;
	
	//apply_impulses(a, b, this.r1, this.r2, vmult(this.n, v_damp*this.nMass));
	var j_damp = w_damp*this.iSum;
	a.w += j_damp*a.i_inv;
	b.w -= j_damp*b.i_inv;
};

// DampedRotarySpring.prototype.getImpulse = function(){ return 0; };

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var RotaryLimitJoint = cp.RotaryLimitJoint = function(a, b, min, max)
{
	Constraint.call(this, a, b);
	
	this.min = min;
	this.max = max;

	this.jAcc = 0;

	this.iSum = this.bias = this.jMax = 0;
};

RotaryLimitJoint.prototype = Object.create(Constraint.prototype);

RotaryLimitJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	var dist = b.a - a.a;
	var pdist = 0;
	if(dist > this.max) {
		pdist = this.max - dist;
	} else if(dist < this.min) {
		pdist = this.min - dist;
	}
	
	// calculate moment of inertia coefficient.
	this.iSum = 1/(1/a.i + 1/b.i);
	
	// calculate bias velocity
	var maxBias = this.maxBias;
	this.bias = clamp(-bias_coef(this.errorBias, dt)*pdist/dt, -maxBias, maxBias);
	
	// compute max impulse
	this.jMax = this.maxForce * dt;

	// If the bias is 0, the joint is not at a limit. Reset the impulse.
	if(!this.bias) this.jAcc = 0;
};

RotaryLimitJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	var a = this.a;
	var b = this.b;
	
	var j = this.jAcc*dt_coef;
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

RotaryLimitJoint.prototype.applyImpulse = function()
{
	if(!this.bias) return; // early exit

	var a = this.a;
	var b = this.b;
	
	// compute relative rotational velocity
	var wr = b.w - a.w;
	
	// compute normal impulse	
	var j = -(this.bias + wr)*this.iSum;
	var jOld = this.jAcc;
	if(this.bias < 0){
		this.jAcc = clamp(jOld + j, 0, this.jMax);
	} else {
		this.jAcc = clamp(jOld + j, -this.jMax, 0);
	}
	j = this.jAcc - jOld;
	
	// apply impulse
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

RotaryLimitJoint.prototype.getImpulse = function()
{
	return Math.abs(joint.jAcc);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var RatchetJoint = cp.RatchetJoint = function(a, b, phase, ratchet)
{
	Constraint.call(this, a, b);

	this.angle = 0;
	this.phase = phase;
	this.ratchet = ratchet;
	
	// STATIC_BODY_CHECK
	this.angle = (b ? b.a : 0) - (a ? a.a : 0);
	
	this.iSum = this.bias = this.jAcc = this.jMax = 0;
};

RatchetJoint.prototype = Object.create(Constraint.prototype);

RatchetJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	var angle = this.angle;
	var phase = this.phase;
	var ratchet = this.ratchet;
	
	var delta = b.a - a.a;
	var diff = angle - delta;
	var pdist = 0;
	
	if(diff*ratchet > 0){
		pdist = diff;
	} else {
		this.angle = Math.floor((delta - phase)/ratchet)*ratchet + phase;
	}
	
	// calculate moment of inertia coefficient.
	this.iSum = 1/(a.i_inv + b.i_inv);
	
	// calculate bias velocity
	var maxBias = this.maxBias;
	this.bias = clamp(-bias_coef(this.errorBias, dt)*pdist/dt, -maxBias, maxBias);
	
	// compute max impulse
	this.jMax = this.maxForce * dt;

	// If the bias is 0, the joint is not at a limit. Reset the impulse.
	if(!this.bias) this.jAcc = 0;
};

RatchetJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	var a = this.a;
	var b = this.b;
	
	var j = this.jAcc*dt_coef;
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

RatchetJoint.prototype.applyImpulse = function()
{
	if(!this.bias) return; // early exit

	var a = this.a;
	var b = this.b;
	
	// compute relative rotational velocity
	var wr = b.w - a.w;
	var ratchet = this.ratchet;
	
	// compute normal impulse	
	var j = -(this.bias + wr)*this.iSum;
	var jOld = this.jAcc;
	this.jAcc = clamp((jOld + j)*ratchet, 0, this.jMax*Math.abs(ratchet))/ratchet;
	j = this.jAcc - jOld;
	
	// apply impulse
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

RatchetJoint.prototype.getImpulse = function(joint)
{
	return Math.abs(joint.jAcc);
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var GearJoint = cp.GearJoint = function(a, b, phase, ratio)
{
	Constraint.call(this, a, b);
	
	this.phase = phase;
	this.ratio = ratio;
	this.ratio_inv = 1/ratio;
	
	this.jAcc = 0;

	this.iSum = this.bias = this.jMax = 0;
};

GearJoint.prototype = Object.create(Constraint.prototype);

GearJoint.prototype.preStep = function(dt)
{
	var a = this.a;
	var b = this.b;
	
	// calculate moment of inertia coefficient.
	this.iSum = 1/(a.i_inv*this.ratio_inv + this.ratio*b.i_inv);
	
	// calculate bias velocity
	var maxBias = this.maxBias;
	this.bias = clamp(-bias_coef(this.errorBias, dt)*(b.a*this.ratio - a.a - this.phase)/dt, -maxBias, maxBias);
	
	// compute max impulse
	this.jMax = this.maxForce * dt;
};

GearJoint.prototype.applyCachedImpulse = function(dt_coef)
{
	var a = this.a;
	var b = this.b;
	
	var j = this.jAcc*dt_coef;
	a.w -= j*a.i_inv*this.ratio_inv;
	b.w += j*b.i_inv;
};

GearJoint.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	// compute relative rotational velocity
	var wr = b.w*this.ratio - a.w;
	
	// compute normal impulse	
	var j = (this.bias - wr)*this.iSum;
	var jOld = this.jAcc;
	this.jAcc = clamp(jOld + j, -this.jMax, this.jMax);
	j = this.jAcc - jOld;
	
	// apply impulse
	a.w -= j*a.i_inv*this.ratio_inv;
	b.w += j*b.i_inv;
};

GearJoint.prototype.getImpulse = function()
{
	return Math.abs(this.jAcc);
};

GearJoint.prototype.setRatio = function(value)
{
	this.ratio = value;
	this.ratio_inv = 1/value;
	this.activateBodies();
};

/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var SimpleMotor = cp.SimpleMotor = function(a, b, rate)
{
	Constraint.call(this, a, b);
	
	this.rate = rate;
	
	this.jAcc = 0;

	this.iSum = this.jMax = 0;
};

SimpleMotor.prototype = Object.create(Constraint.prototype);

SimpleMotor.prototype.preStep = function(dt)
{
	// calculate moment of inertia coefficient.
	this.iSum = 1/(this.a.i_inv + this.b.i_inv);
	
	// compute max impulse
	this.jMax = this.maxForce * dt;
};

SimpleMotor.prototype.applyCachedImpulse = function(dt_coef)
{
	var a = this.a;
	var b = this.b;
	
	var j = this.jAcc*dt_coef;
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

SimpleMotor.prototype.applyImpulse = function()
{
	var a = this.a;
	var b = this.b;
	
	// compute relative rotational velocity
	var wr = b.w - a.w + this.rate;
	
	// compute normal impulse	
	var j = -wr*this.iSum;
	var jOld = this.jAcc;
	this.jAcc = clamp(jOld + j, -this.jMax, this.jMax);
	j = this.jAcc - jOld;
	
	// apply impulse
	a.w -= j*a.i_inv;
	b.w += j*b.i_inv;
};

SimpleMotor.prototype.getImpulse = function()
{
	return Math.abs(this.jAcc);
};

// copied from the npm module 'mersenne', may 2011
//
// this program is a JavaScript version of Mersenne Twister, with concealment and encapsulation in class,
// an almost straight conversion from the original program, mt19937ar.c,
// translated by y. okada on July 17, 2006.
// and modified a little at july 20, 2006, but there are not any substantial differences.
// in this program, procedure descriptions and comments of original source code were not removed.
// lines commented with //c// were originally descriptions of c procedure. and a few following lines are appropriate JavaScript descriptions.
// lines commented with /* and */ are original comments.
// lines commented with // are additional comments in this JavaScript version.
// before using this version, create at least one instance of MersenneTwister19937 class, and initialize the each state, given below in c comments, of all the instances.
/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

function MersenneTwister19937()
{
	/* Period parameters */
	//c//#define N 624
	//c//#define M 397
	//c//#define MATRIX_A 0x9908b0dfUL   /* constant vector a */
	//c//#define UPPER_MASK 0x80000000UL /* most significant w-r bits */
	//c//#define LOWER_MASK 0x7fffffffUL /* least significant r bits */
	var N = 624;
	var M = 397;
	var MATRIX_A = 0x9908b0df;   /* constant vector a */
	var UPPER_MASK = 0x80000000; /* most significant w-r bits */
	var LOWER_MASK = 0x7fffffff; /* least significant r bits */
	//c//static unsigned long mt[N]; /* the array for the state vector  */
	//c//static int mti=N+1; /* mti==N+1 means mt[N] is not initialized */
	var mt = new Array(N);   /* the array for the state vector  */
	var mti = N+1;           /* mti==N+1 means mt[N] is not initialized */

	function unsigned32 (n1) // returns a 32-bits unsiged integer from an operand to which applied a bit operator.
	{
		return n1 < 0 ? (n1 ^ UPPER_MASK) + UPPER_MASK : n1;
	}

	function subtraction32 (n1, n2) // emulates lowerflow of a c 32-bits unsiged integer variable, instead of the operator -. these both arguments must be non-negative integers expressible using unsigned 32 bits.
	{
		return n1 < n2 ? unsigned32((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
	}

	function addition32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator +. these both arguments must be non-negative integers expressible using unsigned 32 bits.
	{
		return unsigned32((n1 + n2) & 0xffffffff)
	}

	function multiplication32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator *. these both arguments must be non-negative integers expressible using unsigned 32 bits.
	{
		var sum = 0;
		for (var i = 0; i < 32; ++i){
			if ((n1 >>> i) & 0x1){
				sum = addition32(sum, unsigned32(n2 << i));
			}
		}
		return sum;
	}

	/* initializes mt[N] with a seed */
	//c//void init_genrand(unsigned long s)
	this.init_genrand = function (s)
	{
		//c//mt[0]= s & 0xffffffff;
		mt[0]= unsigned32(s & 0xffffffff);
		for (mti=1; mti<N; mti++) {
			mt[mti] = 
			//c//(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti);
			addition32(multiplication32(1812433253, unsigned32(mt[mti-1] ^ (mt[mti-1] >>> 30))), mti);
			/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
			/* In the previous versions, MSBs of the seed affect   */
			/* only MSBs of the array mt[].                        */
			/* 2002/01/09 modified by Makoto Matsumoto             */
			//c//mt[mti] &= 0xffffffff;
			mt[mti] = unsigned32(mt[mti] & 0xffffffff);
			/* for >32 bit machines */
		}
	}

	/* initialize by an array with array-length */
	/* init_key is the array for initializing keys */
	/* key_length is its length */
	/* slight change for C++, 2004/2/26 */
	//c//void init_by_array(unsigned long init_key[], int key_length)
	this.init_by_array = function (init_key, key_length)
	{
		//c//int i, j, k;
		var i, j, k;
		//c//init_genrand(19650218);
		this.init_genrand(19650218);
		i=1; j=0;
		k = (N>key_length ? N : key_length);
		for (; k; k--) {
			//c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1664525))
			//c//	+ init_key[j] + j; /* non linear */
			mt[i] = addition32(addition32(unsigned32(mt[i] ^ multiplication32(unsigned32(mt[i-1] ^ (mt[i-1] >>> 30)), 1664525)), init_key[j]), j);
			mt[i] = 
			//c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
			unsigned32(mt[i] & 0xffffffff);
			i++; j++;
			if (i>=N) { mt[0] = mt[N-1]; i=1; }
			if (j>=key_length) j=0;
		}
		for (k=N-1; k; k--) {
			//c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1566083941))
			//c//- i; /* non linear */
			mt[i] = subtraction32(unsigned32((dbg=mt[i]) ^ multiplication32(unsigned32(mt[i-1] ^ (mt[i-1] >>> 30)), 1566083941)), i);
			//c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
			mt[i] = unsigned32(mt[i] & 0xffffffff);
			i++;
			if (i>=N) { mt[0] = mt[N-1]; i=1; }
		}
		mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
	}

    /* moved outside of genrand_int32() by jwatte 2010-11-17; generate less garbage */
    var mag01 = [0x0, MATRIX_A];

	/* generates a random number on [0,0xffffffff]-interval */
	//c//unsigned long genrand_int32(void)
	this.genrand_int32 = function ()
	{
		//c//unsigned long y;
		//c//static unsigned long mag01[2]={0x0UL, MATRIX_A};
		var y;
		/* mag01[x] = x * MATRIX_A  for x=0,1 */

		if (mti >= N) { /* generate N words at one time */
			//c//int kk;
			var kk;

			if (mti == N+1)   /* if init_genrand() has not been called, */
				//c//init_genrand(5489); /* a default initial seed is used */
				this.init_genrand(5489); /* a default initial seed is used */

			for (kk=0;kk<N-M;kk++) {
				//c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
				//c//mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
				y = unsigned32((mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK));
				mt[kk] = unsigned32(mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1]);
			}
			for (;kk<N-1;kk++) {
				//c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
				//c//mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1];
				y = unsigned32((mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK));
				mt[kk] = unsigned32(mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1]);
			}
			//c//y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
			//c//mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1];
			y = unsigned32((mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK));
			mt[N-1] = unsigned32(mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1]);
			mti = 0;
		}

		y = mt[mti++];

		/* Tempering */
		//c//y ^= (y >> 11);
		//c//y ^= (y << 7) & 0x9d2c5680;
		//c//y ^= (y << 15) & 0xefc60000;
		//c//y ^= (y >> 18);
		y = unsigned32(y ^ (y >>> 11));
		y = unsigned32(y ^ ((y << 7) & 0x9d2c5680));
		y = unsigned32(y ^ ((y << 15) & 0xefc60000));
		y = unsigned32(y ^ (y >>> 18));

		return y;
	}

	/* generates a random number on [0,0x7fffffff]-interval */
	//c//long genrand_int31(void)
	this.genrand_int31 = function ()
	{
		//c//return (genrand_int32()>>1);
		return (this.genrand_int32()>>>1);
	}

	/* generates a random number on [0,1]-real-interval */
	//c//double genrand_real1(void)
	this.genrand_real1 = function ()
	{
		//c//return genrand_int32()*(1.0/4294967295.0);
		return this.genrand_int32()*(1.0/4294967295.0);
		/* divided by 2^32-1 */
	}

	/* generates a random number on [0,1)-real-interval */
	//c//double genrand_real2(void)
	this.genrand_real2 = function ()
	{
		//c//return genrand_int32()*(1.0/4294967296.0);
		return this.genrand_int32()*(1.0/4294967296.0);
		/* divided by 2^32 */
	}

	/* generates a random number on (0,1)-real-interval */
	//c//double genrand_real3(void)
	this.genrand_real3 = function ()
	{
		//c//return ((genrand_int32()) + 0.5)*(1.0/4294967296.0);
		return ((this.genrand_int32()) + 0.5)*(1.0/4294967296.0);
		/* divided by 2^32 */
	}

	/* generates a random number on [0,1) with 53-bit resolution*/
	//c//double genrand_res53(void)
	this.genrand_res53 = function ()
	{
		//c//unsigned long a=genrand_int32()>>5, b=genrand_int32()>>6;
		var a=this.genrand_int32()>>>5, b=this.genrand_int32()>>>6;
		return(a*67108864.0+b)*(1.0/9007199254740992.0);
	}
	/* These real versions are due to Isaku Wada, 2002/01/09 added */
}

//  Exports: Public API
var mersenne = {};

//  Export the twister class
mersenne.MersenneTwister19937 = MersenneTwister19937;

//  Export a simplified function to generate random numbers
var gen = new MersenneTwister19937;
gen.init_genrand((new Date).getTime() % 1000000000);
mersenne.rand = function(N) {
    if (!N)
        {
        N = 32768;
        }
    return Math.floor(gen.genrand_real2() * N);
}
mersenne.rand_real = function () {
	return gen.genrand_real2()
}
mersenne.seed = function(S) {
    if (typeof(S) != 'number')
        {
        throw new Error("seed(S) must take numeric argument; is " + typeof(S));
        }
    gen.init_genrand(S);
}
mersenne.seed_array = function(A) {
    if (typeof(A) != 'object')
        {
        throw new Error("seed_array(A) must take array of numbers; is " + typeof(A));
        }
    gen.init_by_array(A);
}


var space;
var bench_list = [];
var add_benchmark = function(name, initfn) {
	var bench = typeof(name) === 'string' ? {name: name} : name;
	bench.init = initfn;
	bench.dt = bench.dt || 1/60;
	bench_list.push(bench);
}

function v(x, y) {
	return new Vect(x, y);
}

var simple_terrain_verts = [
	v(350.00, 425.07), v(336.00, 436.55), v(272.00, 435.39), v(258.00, 427.63), v(225.28, 420.00), v(202.82, 396.00),
	v(191.81, 388.00), v(189.00, 381.89), v(173.00, 380.39), v(162.59, 368.00), v(150.47, 319.00), v(128.00, 311.55),
	v(119.14, 286.00), v(126.84, 263.00), v(120.56, 227.00), v(141.14, 178.00), v(137.52, 162.00), v(146.51, 142.00),
	v(156.23, 136.00), v(158.00, 118.27), v(170.00, 100.77), v(208.43,  84.00), v(224.00,  69.65), v(249.30,  68.00),
	v(257.00,  54.77), v(363.00,  45.94), v(374.15,  54.00), v(386.00,  69.60), v(413.00,  70.73), v(456.00,  84.89),
	v(468.09,  99.00), v(467.09, 123.00), v(464.92, 135.00), v(469.00, 141.03), v(497.00, 148.67), v(513.85, 180.00),
	v(509.56, 223.00), v(523.51, 247.00), v(523.00, 277.00), v(497.79, 311.00), v(478.67, 348.00), v(467.90, 360.00),
	v(456.76, 382.00), v(432.95, 389.00), v(417.00, 411.32), v(373.00, 433.19), v(361.00, 430.02), v(350.00, 425.07)
];

var frand_unit_circle = function(){
	var vv = new Vect(mersenne.rand_real()*2 - 1, mersenne.rand_real()*2 - 1);
	return (vlengthsq(vv) < 1 ? vv : frand_unit_circle());
};

var add_circle = function(i, radius){
	var mass = radius*radius/25;
	var body = space.addBody(new Body(mass, momentForCircle(mass, 0, radius, vzero)));
//	cpBody *body = cpSpaceAddBody(space, cpBodyInit(&bodies[i], mass, cpMomentForCircle(mass, 0, radius, vzero)));
	body.p = vmult(frand_unit_circle(), 180);
	
	
	var shape = space.addShape(new CircleShape(body, radius, vzero));
//	cpShape *shape = cpSpaceAddShape(space, cpCircleShapeInit(&circles[i], body, radius, vzero));
	shape.e = 0; shape.u = 0.9;
};

var add_box = function(i, size){
	var mass = size*size/100;
	var body = space.addBody(new Body(mass, momentForBox(mass, size, size)));
//	cpBody *body = cpSpaceAddBody(space, cpBodyInit(&bodies[i], mass, cpMomentForBox(mass, size, size)));
	body.p = vmult(frand_unit_circle(), 180);
	
	
	var shape = space.addShape(new BoxShape(body, size, size));
	shape.e = 0; shape.u = 0.9;
};

var add_hexagon = function(i, radius){
	var hexagon = new Array(12);
	for(var i=0; i<12; i+=2){
		var angle = -Math.PI*i/6;
		var p = vmult(v(Math.cos(angle), Math.sin(angle)), radius);
		hexagon[i] = p.x;
		hexagon[i+1] = p.y;
	}
	
	var mass = radius*radius;
	var body = space.addBody(new Body(mass, momentForPoly(mass, hexagon, vzero)));
	body.p = vmult(frand_unit_circle(), 180);
	
	var shape = space.addShape(new PolyShape(body, hexagon, vzero));
	shape.e = 0; shape.u = 0.9;
};

var setupSpace_simpleTerrain = function(){
	space = new Space();
	space.iterations = 10;
	space.gravity = v(0, -100);
	space.collisionSlop = 0.5;
	
	var offset = v(-320, -240);
	for(var i=0; i<(simple_terrain_verts.length - 1); i++){
		var a = simple_terrain_verts[i], b = simple_terrain_verts[i+1];
		space.addShape(new SegmentShape(space.staticBody, vadd(a, offset), vadd(b, offset), 0));
	}
};


// SimpleTerrain constant sized objects
var init_SimpleTerrain = function(num, fn){
	return function(){
		setupSpace_simpleTerrain();
		for(var i=0; i<num; i++) fn(i);
		
		return space;
	};
};

add_benchmark({name:'SimpleTerrainCircles 1000', ticks:100}, init_SimpleTerrain(1000, function(i) { add_circle(i, 5); }));
add_benchmark('SimpleTerrainCircles 500', init_SimpleTerrain(500, function(i) { add_circle(i, 5); }));
add_benchmark({name:'SimpleTerrainCircles 100', ticks:1000}, init_SimpleTerrain(100, function(i) { add_circle(i, 5); }));

add_benchmark({name:'SimpleTerrainBoxes 1000', ticks:50}, init_SimpleTerrain(1000, function(i) { add_box(i, 10); }));
add_benchmark('SimpleTerrainBoxes 500', init_SimpleTerrain(500, function(i) { add_box(i, 10); }));
add_benchmark({name:'SimpleTerrainBoxes 100', ticks:1000}, init_SimpleTerrain(100, function(i) { add_box(i, 10); }));

add_benchmark({name:'SimpleTerrainHexagons 1000', ticks:100}, init_SimpleTerrain(1000, function(i) { add_hexagon(i, 5); }));
add_benchmark('SimpleTerrainHexagons 500', init_SimpleTerrain(500, function(i) { add_hexagon(i, 5); }));
add_benchmark({name:'SimpleTerrainHexagons 100', ticks:1000}, init_SimpleTerrain(100, function(i) { add_hexagon(i, 5); }));


// SimpleTerrain variable sized objects
var rand_size = function(){
	return Math.pow(1.5, lerp(-1.5, 3.5, mersenne.rand_real()));
};

add_benchmark({name:'SimpleTerrainVCircles 200', ticks:500}, function(){
	setupSpace_simpleTerrain();
	for(var i=0; i<200; i++) add_circle(i, 5*rand_size());
	
	return space;
});

add_benchmark({name:'SimpleTerrainVBoxes 200', ticks:500}, function(){
	setupSpace_simpleTerrain();
	for(var i=0; i<200; i++) add_box(i, 8*rand_size());
	
	return space;
});

add_benchmark({name:'SimpleTerrainVHexagons 200', ticks:500}, function(){
	setupSpace_simpleTerrain();
	for(var i=0; i<200; i++) add_hexagon(i, 5*rand_size());
	
	return space;
});


// ComplexTerrain
var complex_terrain_verts = [
	v( 46.78, 479.00), v( 35.00, 475.63), v( 27.52, 469.00), v( 23.52, 455.00), v( 23.78, 441.00), v( 28.41, 428.00), v( 49.61, 394.00), v( 59.00, 381.56), v( 80.00, 366.03), v( 81.46, 358.00), v( 86.31, 350.00), v( 77.74, 320.00),
	v( 70.26, 278.00), v( 67.51, 270.00), v( 58.86, 260.00), v( 57.19, 247.00), v( 38.00, 235.60), v( 25.76, 221.00), v( 24.58, 209.00), v( 27.63, 202.00), v( 31.28, 198.00), v( 40.00, 193.72), v( 48.00, 193.73), v( 55.00, 196.70),
	v( 62.10, 204.00), v( 71.00, 209.04), v( 79.00, 206.55), v( 88.00, 206.81), v( 95.88, 211.00), v(103.00, 220.49), v(131.00, 220.51), v(137.00, 222.66), v(143.08, 228.00), v(146.22, 234.00), v(147.08, 241.00), v(145.45, 248.00),
	v(142.31, 253.00), v(132.00, 259.30), v(115.00, 259.70), v(109.28, 270.00), v(112.91, 296.00), v(119.69, 324.00), v(129.00, 336.26), v(141.00, 337.59), v(153.00, 331.57), v(175.00, 325.74), v(188.00, 325.19), v(235.00, 317.46),
	v(250.00, 317.19), v(255.00, 309.12), v(262.62, 302.00), v(262.21, 295.00), v(248.00, 273.59), v(229.00, 257.93), v(221.00, 255.48), v(215.00, 251.59), v(210.79, 246.00), v(207.47, 234.00), v(203.25, 227.00), v(179.00, 205.90),
	v(148.00, 189.54), v(136.00, 181.45), v(120.00, 180.31), v(110.00, 181.65), v( 95.00, 179.31), v( 63.00, 166.96), v( 50.00, 164.23), v( 31.00, 154.49), v( 19.76, 145.00), v( 15.96, 136.00), v( 16.65, 127.00), v( 20.57, 120.00),
	v( 28.00, 114.63), v( 40.00, 113.67), v( 65.00, 127.22), v( 73.00, 128.69), v( 81.96, 120.00), v( 77.58, 103.00), v( 78.18,  92.00), v( 59.11,  77.00), v( 52.00,  67.29), v( 31.29,  55.00), v( 25.67,  47.00), v( 24.65,  37.00),
	v( 27.82,  29.00), v( 35.00,  22.55), v( 44.00,  20.35), v( 49.00,  20.81), v( 61.00,  25.69), v( 79.00,  37.81), v( 88.00,  49.64), v( 97.00,  56.65), v(109.00,  49.61), v(143.00,  38.96), v(197.00,  37.27), v(215.00,  35.30),
	v(222.00,  36.65), v(228.42,  41.00), v(233.30,  49.00), v(234.14,  57.00), v(231.00,  65.80), v(224.00,  72.38), v(218.00,  74.50), v(197.00,  76.62), v(145.00,  78.81), v(123.00,  87.41), v(117.59,  98.00), v(117.79, 104.00),
	v(119.00, 106.23), v(138.73, 120.00), v(148.00, 129.50), v(158.50, 149.00), v(203.93, 175.00), v(229.00, 196.60), v(238.16, 208.00), v(245.20, 221.00), v(275.45, 245.00), v(289.00, 263.24), v(303.60, 287.00), v(312.00, 291.57),
	v(339.25, 266.00), v(366.33, 226.00), v(363.43, 216.00), v(364.13, 206.00), v(353.00, 196.72), v(324.00, 181.05), v(307.00, 169.63), v(274.93, 156.00), v(256.00, 152.48), v(228.00, 145.13), v(221.09, 142.00), v(214.87, 135.00),
	v(212.67, 127.00), v(213.81, 119.00), v(219.32, 111.00), v(228.00, 106.52), v(236.00, 106.39), v(290.00, 119.40), v(299.33, 114.00), v(300.52, 109.00), v(300.30,  53.00), v(301.46,  47.00), v(305.00,  41.12), v(311.00,  36.37),
	v(317.00,  34.43), v(325.00,  34.81), v(334.90,  41.00), v(339.45,  50.00), v(339.82, 132.00), v(346.09, 139.00), v(350.00, 150.26), v(380.00, 167.38), v(393.00, 166.48), v(407.00, 155.54), v(430.00, 147.30), v(437.78, 135.00),
	v(433.13, 122.00), v(410.23,  78.00), v(401.59,  69.00), v(393.48,  56.00), v(392.80,  44.00), v(395.50,  38.00), v(401.00,  32.49), v(409.00,  29.41), v(420.00,  30.84), v(426.92,  36.00), v(432.32,  44.00), v(439.49,  51.00),
	v(470.13, 108.00), v(475.71, 124.00), v(483.00, 130.11), v(488.00, 139.43), v(529.00, 139.40), v(536.00, 132.52), v(543.73, 129.00), v(540.47, 115.00), v(541.11, 100.00), v(552.18,  68.00), v(553.78,  47.00), v(559.00,  39.76),
	v(567.00,  35.52), v(577.00,  35.45), v(585.00,  39.58), v(591.38,  50.00), v(591.67,  66.00), v(590.31,  79.00), v(579.76, 109.00), v(582.25, 119.00), v(583.66, 136.00), v(586.45, 143.00), v(586.44, 151.00), v(580.42, 168.00),
	v(577.15, 173.00), v(572.00, 177.13), v(564.00, 179.49), v(478.00, 178.81), v(443.00, 184.76), v(427.10, 190.00), v(424.00, 192.11), v(415.94, 209.00), v(408.82, 228.00), v(405.82, 241.00), v(411.00, 250.82), v(415.00, 251.50),
	v(428.00, 248.89), v(469.00, 246.29), v(505.00, 246.49), v(533.00, 243.60), v(541.87, 248.00), v(547.55, 256.00), v(548.48, 267.00), v(544.00, 276.00), v(534.00, 282.24), v(513.00, 285.46), v(468.00, 285.76), v(402.00, 291.70),
	v(392.00, 290.29), v(377.00, 294.46), v(367.00, 294.43), v(356.44, 304.00), v(354.22, 311.00), v(362.00, 321.36), v(390.00, 322.44), v(433.00, 330.16), v(467.00, 332.76), v(508.00, 347.64), v(522.00, 357.67), v(528.00, 354.46),
	v(536.00, 352.96), v(546.06, 336.00), v(553.47, 306.00), v(564.19, 282.00), v(567.84, 268.00), v(578.72, 246.00), v(585.00, 240.97), v(592.00, 238.91), v(600.00, 239.72), v(606.00, 242.82), v(612.36, 251.00), v(613.35, 263.00),
	v(588.75, 324.00), v(583.25, 350.00), v(572.12, 370.00), v(575.45, 378.00), v(575.20, 388.00), v(589.00, 393.81), v(599.20, 404.00), v(607.14, 416.00), v(609.96, 430.00), v(615.45, 441.00), v(613.44, 462.00), v(610.48, 469.00),
	v(603.00, 475.63), v(590.96, 479.00)
];

add_benchmark({name:'ComplexTerrainCircles 1000', ticks:100}, function(){
	space = new Space();
	space.iterations = 10;
	space.gravity = v(0, -100);
	space.collisionSlop = 0.5;
	
	var offset = v(-320, -240);
	for(var i=0; i<(complex_terrain_verts.length - 1); i++){
		var a = complex_terrain_verts[i], b = complex_terrain_verts[i+1];
		space.addShape(new SegmentShape(space.staticBody, vadd(a, offset), vadd(b, offset), 0));
	}
	
	for(var i=0; i<1000; i++){
		var radius = 5;
		var mass = radius*radius;
		var body = space.addBody(new Body(mass, momentForCircle(mass, 0, radius, vzero)));
		body.p = vadd(vmult(frand_unit_circle(), 180), v(0, 300));
		
		var shape = space.addShape(new CircleShape(body, radius, vzero));
		shape.e = 0; shape.u = 0;
	}
	
	return space;
});

add_benchmark({name:'ComplexTerrainHexagons 1000', ticks:50}, function(){
	space = new Space();
	space.iterations = 10;
	space.gravity = v(0, -100);
	space.collisionSlop = 0.5;
	
	var offset = v(-320, -240);
	for(var i=0; i<(complex_terrain_verts.length - 1); i++){
		var a = complex_terrain_verts[i], b = complex_terrain_verts[i+1];
		space.addShape(new SegmentShape(space.staticBody, vadd(a, offset), vadd(b, offset), 0));
	}
	
	var radius = 5;
	var hexagon = new Array(12);
	for(var i=0; i<12; i+=2){
		var angle = -Math.PI*i/6;
		var p = vmult(v(Math.cos(angle), Math.sin(angle)), radius);
		hexagon[i] = p.x;
		hexagon[i+1] = p.y;
	}
	
	for(var i=0; i<1000; i++){
		var mass = radius*radius;
		var body = space.addBody(new Body(mass, momentForPoly(mass, hexagon, vzero)));
		body.p = vadd(vmult(frand_unit_circle(), 180), v(0, 300));
		
		var shape = space.addShape(new PolyShape(body, hexagon, vzero));
		shape.e = 0; shape.u = 0;
	}
	
	return space;
});

// BouncyTerrain
var bouncy_terrain_verts = [
	v(537.18,  23.00), v(520.50,  36.00), v(501.53,  63.00), v(496.14,  76.00), v(498.86,  86.00), v(504.00,  90.51), v(508.00,  91.36), v(508.77,  84.00), v(513.00,  77.73), v(519.00,  74.48), v(530.00,  74.67), v(545.00,  54.65),
	v(554.00,  48.77), v(562.00,  46.39), v(568.00,  45.94), v(568.61,  47.00), v(567.94,  55.00), v(571.27,  64.00), v(572.92,  80.00), v(572.00,  81.39), v(563.00,  79.93), v(556.00,  82.69), v(551.49,  88.00), v(549.00,  95.76),
	v(538.00,  93.40), v(530.00, 102.38), v(523.00, 104.00), v(517.00, 103.02), v(516.22, 109.00), v(518.96, 116.00), v(526.00, 121.15), v(534.00, 116.48), v(543.00, 116.77), v(549.28, 121.00), v(554.00, 130.17), v(564.00, 125.67),
	v(575.60, 129.00), v(573.31, 121.00), v(567.77, 111.00), v(575.00, 106.47), v(578.51, 102.00), v(580.25,  95.00), v(577.98,  87.00), v(582.00,  85.71), v(597.00,  89.46), v(604.80,  95.00), v(609.28, 104.00), v(610.55, 116.00),
	v(609.30, 125.00), v(600.80, 142.00), v(597.31, 155.00), v(584.00, 167.23), v(577.86, 175.00), v(583.52, 184.00), v(582.64, 195.00), v(591.00, 196.56), v(597.81, 201.00), v(607.45, 219.00), v(607.51, 246.00), v(600.00, 275.46),
	v(588.00, 267.81), v(579.00, 264.91), v(557.00, 264.41), v(552.98, 259.00), v(548.00, 246.18), v(558.00, 247.12), v(565.98, 244.00), v(571.10, 237.00), v(571.61, 229.00), v(568.25, 222.00), v(562.00, 217.67), v(544.00, 213.93),
	v(536.73, 214.00), v(535.60, 204.00), v(539.69, 181.00), v(542.84, 171.00), v(550.43, 161.00), v(540.00, 156.27), v(536.62, 152.00), v(534.70, 146.00), v(527.00, 141.88), v(518.59, 152.00), v(514.51, 160.00), v(510.33, 175.00),
	v(519.38, 183.00), v(520.52, 194.00), v(516.00, 201.27), v(505.25, 206.00), v(507.57, 223.00), v(519.90, 260.00), v(529.00, 260.48), v(534.00, 262.94), v(538.38, 268.00), v(540.00, 275.00), v(537.06, 284.00), v(530.00, 289.23),
	v(520.00, 289.23), v(513.00, 284.18), v(509.71, 286.00), v(501.69, 298.00), v(501.56, 305.00), v(504.30, 311.00), v(512.00, 316.43), v(521.00, 316.42), v(525.67, 314.00), v(535.00, 304.98), v(562.00, 294.80), v(573.00, 294.81),
	v(587.52, 304.00), v(600.89, 310.00), v(596.96, 322.00), v(603.28, 327.00), v(606.52, 333.00), v(605.38, 344.00), v(597.65, 352.00), v(606.36, 375.00), v(607.16, 384.00), v(603.40, 393.00), v(597.00, 398.14), v(577.00, 386.15),
	v(564.35, 373.00), v(565.21, 364.00), v(562.81, 350.00), v(553.00, 346.06), v(547.48, 338.00), v(547.48, 330.00), v(550.00, 323.30), v(544.00, 321.53), v(537.00, 322.70), v(532.00, 326.23), v(528.89, 331.00), v(527.83, 338.00),
	v(533.02, 356.00), v(542.00, 360.73), v(546.68, 369.00), v(545.38, 379.00), v(537.58, 386.00), v(537.63, 388.00), v(555.00, 407.47), v(563.00, 413.52), v(572.57, 418.00), v(582.72, 426.00), v(578.00, 431.12), v(563.21, 440.00),
	v(558.00, 449.27), v(549.00, 452.94), v(541.00, 451.38), v(536.73, 448.00), v(533.00, 441.87), v(520.00, 437.96), v(514.00, 429.69), v(490.00, 415.15), v(472.89, 399.00), v(472.03, 398.00), v(474.00, 396.71), v(486.00, 393.61),
	v(492.00, 385.85), v(492.00, 376.15), v(489.04, 371.00), v(485.00, 368.11), v(480.00, 376.27), v(472.00, 379.82), v(463.00, 378.38), v(455.08, 372.00), v(446.00, 377.69), v(439.00, 385.24), v(436.61, 391.00), v(437.52, 404.00),
	v(440.00, 409.53), v(463.53, 433.00), v(473.80, 441.00), v(455.00, 440.30), v(443.00, 436.18), v(436.00, 431.98), v(412.00, 440.92), v(397.00, 442.46), v(393.59, 431.00), v(393.71, 412.00), v(400.00, 395.10), v(407.32, 387.00),
	v(408.54, 380.00), v(407.42, 375.00), v(403.97, 370.00), v(399.00, 366.74), v(393.00, 365.68), v(391.23, 374.00), v(387.00, 380.27), v(381.00, 383.52), v(371.56, 384.00), v(364.98, 401.00), v(362.96, 412.00), v(363.63, 435.00),
	v(345.00, 433.55), v(344.52, 442.00), v(342.06, 447.00), v(337.00, 451.38), v(330.00, 453.00), v(325.00, 452.23), v(318.00, 448.17), v(298.00, 453.70), v(284.00, 451.49), v(278.62, 449.00), v(291.47, 408.00), v(291.77, 398.00),
	v(301.00, 393.83), v(305.00, 393.84), v(305.60, 403.00), v(310.00, 409.47), v(318.00, 413.07), v(325.00, 412.40), v(332.31, 407.00), v(335.07, 400.00), v(334.40, 393.00), v(329.00, 385.69), v(319.00, 382.79), v(301.00, 389.23),
	v(289.00, 389.97), v(265.00, 389.82), v(251.00, 385.85), v(245.00, 389.23), v(239.00, 389.94), v(233.00, 388.38), v(226.00, 382.04), v(206.00, 374.75), v(206.00, 394.00), v(204.27, 402.00), v(197.00, 401.79), v(191.00, 403.49),
	v(186.53, 407.00), v(183.60, 412.00), v(183.60, 422.00), v(189.00, 429.31), v(196.00, 432.07), v(203.00, 431.40), v(209.47, 427.00), v(213.00, 419.72), v(220.00, 420.21), v(227.00, 418.32), v(242.00, 408.41), v(258.98, 409.00),
	v(250.00, 435.43), v(239.00, 438.78), v(223.00, 448.19), v(209.00, 449.70), v(205.28, 456.00), v(199.00, 460.23), v(190.00, 460.52), v(182.73, 456.00), v(178.00, 446.27), v(160.00, 441.42), v(148.35, 435.00), v(149.79, 418.00),
	v(157.72, 401.00), v(161.00, 396.53), v(177.00, 385.00), v(180.14, 380.00), v(181.11, 374.00), v(180.00, 370.52), v(170.00, 371.68), v(162.72, 368.00), v(158.48, 361.00), v(159.56, 349.00), v(154.00, 342.53), v(146.00, 339.85),
	v(136.09, 343.00), v(130.64, 351.00), v(131.74, 362.00), v(140.61, 374.00), v(130.68, 387.00), v(120.75, 409.00), v(118.09, 421.00), v(117.92, 434.00), v(100.00, 432.40), v( 87.00, 427.48), v( 81.59, 423.00), v( 73.64, 409.00),
	v( 72.57, 398.00), v( 74.62, 386.00), v( 78.80, 378.00), v( 88.00, 373.43), v( 92.49, 367.00), v( 93.32, 360.00), v( 91.30, 353.00), v(103.00, 342.67), v(109.00, 343.10), v(116.00, 340.44), v(127.33, 330.00), v(143.00, 327.24),
	v(154.30, 322.00), v(145.00, 318.06), v(139.77, 311.00), v(139.48, 302.00), v(144.95, 293.00), v(143.00, 291.56), v(134.00, 298.21), v(118.00, 300.75), v(109.40, 305.00), v( 94.67, 319.00), v( 88.00, 318.93), v( 81.00, 321.69),
	v( 67.24, 333.00), v( 56.68, 345.00), v( 53.00, 351.40), v( 47.34, 333.00), v( 50.71, 314.00), v( 56.57, 302.00), v( 68.00, 287.96), v( 91.00, 287.24), v(110.00, 282.36), v(133.80, 271.00), v(147.34, 256.00), v(156.47, 251.00),
	v(157.26, 250.00), v(154.18, 242.00), v(154.48, 236.00), v(158.72, 229.00), v(166.71, 224.00), v(170.15, 206.00), v(170.19, 196.00), v(167.24, 188.00), v(160.00, 182.67), v(150.00, 182.66), v(143.60, 187.00), v(139.96, 195.00),
	v(139.50, 207.00), v(136.45, 221.00), v(136.52, 232.00), v(133.28, 238.00), v(129.00, 241.38), v(119.00, 243.07), v(115.00, 246.55), v(101.00, 253.16), v( 86.00, 257.32), v( 63.00, 259.24), v( 57.00, 257.31), v( 50.54, 252.00),
	v( 47.59, 247.00), v( 46.30, 240.00), v( 47.58, 226.00), v( 50.00, 220.57), v( 58.00, 226.41), v( 69.00, 229.17), v( 79.00, 229.08), v( 94.50, 225.00), v(100.21, 231.00), v(107.00, 233.47), v(107.48, 224.00), v(109.94, 219.00),
	v(115.00, 214.62), v(122.57, 212.00), v(116.00, 201.49), v(104.00, 194.57), v( 90.00, 194.04), v( 79.00, 198.21), v( 73.00, 198.87), v( 62.68, 191.00), v( 62.58, 184.00), v( 64.42, 179.00), v( 75.00, 167.70), v( 80.39, 157.00),
	v( 68.79, 140.00), v( 61.67, 126.00), v( 61.47, 117.00), v( 64.43, 109.00), v( 63.10,  96.00), v( 56.48,  82.00), v( 48.00,  73.88), v( 43.81,  66.00), v( 43.81,  56.00), v( 50.11,  46.00), v( 59.00,  41.55), v( 71.00,  42.64),
	v( 78.00,  36.77), v( 83.00,  34.75), v( 99.00,  34.32), v(117.00,  38.92), v(133.00,  55.15), v(142.00,  50.70), v(149.74,  51.00), v(143.55,  68.00), v(153.28,  74.00), v(156.23,  79.00), v(157.00,  84.00), v(156.23,  89.00),
	v(153.28,  94.00), v(144.58,  99.00), v(151.52, 112.00), v(151.51, 124.00), v(150.00, 126.36), v(133.00, 130.25), v(126.71, 125.00), v(122.00, 117.25), v(114.00, 116.23), v(107.73, 112.00), v(104.48, 106.00), v(104.32,  99.00),
	v(106.94,  93.00), v(111.24,  89.00), v(111.60,  85.00), v(107.24,  73.00), v(102.00,  67.57), v( 99.79,  67.00), v( 99.23,  76.00), v( 95.00,  82.27), v( 89.00,  85.52), v( 79.84,  86.00), v( 86.73, 114.00), v( 98.00, 136.73),
	v( 99.00, 137.61), v(109.00, 135.06), v(117.00, 137.94), v(122.52, 146.00), v(122.94, 151.00), v(121.00, 158.58), v(134.00, 160.97), v(153.00, 157.45), v(171.30, 150.00), v(169.06, 142.00), v(169.77, 136.00), v(174.00, 129.73),
	v(181.46, 126.00), v(182.22, 120.00), v(182.20, 111.00), v(180.06, 101.00), v(171.28,  85.00), v(171.75,  80.00), v(182.30,  53.00), v(189.47,  50.00), v(190.62,  38.00), v(194.00,  33.73), v(199.00,  30.77), v(208.00,  30.48),
	v(216.00,  34.94), v(224.00,  31.47), v(240.00,  30.37), v(247.00,  32.51), v(249.77,  35.00), v(234.75,  53.00), v(213.81,  93.00), v(212.08,  99.00), v(213.00, 101.77), v(220.00,  96.77), v(229.00,  96.48), v(236.28, 101.00),
	v(240.00, 107.96), v(245.08, 101.00), v(263.00,  65.32), v(277.47,  48.00), v(284.00,  47.03), v(286.94,  41.00), v(292.00,  36.62), v(298.00,  35.06), v(304.00,  35.77), v(314.00,  43.81), v(342.00,  32.56), v(359.00,  31.32),
	v(365.00,  32.57), v(371.00,  36.38), v(379.53,  48.00), v(379.70,  51.00), v(356.00,  52.19), v(347.00,  54.74), v(344.38,  66.00), v(341.00,  70.27), v(335.00,  73.52), v(324.00,  72.38), v(317.00,  65.75), v(313.00,  67.79),
	v(307.57,  76.00), v(315.00,  78.62), v(319.28,  82.00), v(322.23,  87.00), v(323.00,  94.41), v(334.00,  92.49), v(347.00,  87.47), v(349.62,  80.00), v(353.00,  75.73), v(359.00,  72.48), v(366.00,  72.32), v(372.00,  74.94),
	v(377.00,  81.34), v(382.00,  83.41), v(392.00,  83.40), v(399.00,  79.15), v(404.00,  85.74), v(411.00,  85.06), v(417.00,  86.62), v(423.38,  93.00), v(425.05, 104.00), v(438.00, 110.35), v(450.00, 112.17), v(452.62, 103.00),
	v(456.00,  98.73), v(462.00,  95.48), v(472.00,  95.79), v(471.28,  92.00), v(464.00,  84.62), v(445.00,  80.39), v(436.00,  75.33), v(428.00,  68.46), v(419.00,  68.52), v(413.00,  65.27), v(408.48,  58.00), v(409.87,  46.00),
	v(404.42,  39.00), v(408.00,  33.88), v(415.00,  29.31), v(429.00,  26.45), v(455.00,  28.77), v(470.00,  33.81), v(482.00,  42.16), v(494.00,  46.85), v(499.65,  36.00), v(513.00,  25.95), v(529.00,  22.42), v(537.18,  23.00), 
];

add_benchmark('BouncyTerrainCircles 500', function(){
	space = new Space();
	space.iterations = 10;
	
	var offset = v(-320, -240);
	for(var i=0; i<(bouncy_terrain_verts.length - 1); i++){
		var a = bouncy_terrain_verts[i], b = bouncy_terrain_verts[i+1];
		var shape = space.addShape(new SegmentShape(space.staticBody, vadd(a, offset), vadd(b, offset), 0));
		shape.e = 1;
	}
	
	for(var i=0; i<500; i++){
		var radius = 5;
		var mass = radius*radius;
		var body = space.addBody(new Body(mass, momentForCircle(mass, 0, radius, vzero)));
		body.p = vadd(vmult(frand_unit_circle(), 130), vzero);
		var vv = vmult(frand_unit_circle(), 50);
		body.vx = vv.x; body.vy = vv.y;
		
		var shape = space.addShape(new CircleShape(body, radius, vzero));
		shape.e = 1;
	}
	
	return space;
});

add_benchmark('BouncyTerrainHexagons 500', function(){
	space = new Space();
	space.iterations = 10;
	
	var offset = v(-320, -240);
	for(var i=0; i<(bouncy_terrain_verts.length - 1); i++){
		var a = bouncy_terrain_verts[i], b = bouncy_terrain_verts[i+1];
		var shape = space.addShape(new SegmentShape(space.staticBody, vadd(a, offset), vadd(b, offset), 0));
		shape.e = 1;
	}
	
	var radius = 5;
	var hexagon = new Array(12);
	for(var i=0; i<12; i+=2){
		var angle = -Math.PI*i/6;
		var p = vmult(v(Math.cos(angle), Math.sin(angle)), radius);
		hexagon[i] = p.x;
		hexagon[i+1] = p.y;
	}
	
	for(var i=0; i<500; i++){
		var mass = radius*radius;
		var body = space.addBody(new Body(mass, momentForPoly(mass, hexagon, vzero)));
		body.p = vadd(vmult(frand_unit_circle(), 130), vzero);
		var vv = vmult(frand_unit_circle(), 50);
		body.vx = vv.x; body.vy = vv.y;
		
		var shape = space.addShape(new PolyShape(body, hexagon, vzero));
		shape.e = 1;
	}
	
	return space;
});


// No collisions

var noCollide_begin = function(arb, space){
	throw new Exception('Should not get here');
};

add_benchmark({name:'NoCollide', ticks:2000}, function(){
	space = new Space();
	space.iterations = 10;
	
	space.addCollisionHandler(2, 2, noCollide_begin, null, null, null, null);
	
	var radius = 4.5;
	
	space.addShape(new SegmentShape(space.staticBody, v(-330-radius, -250-radius), v( 330+radius, -250-radius), 0)).e = 1;
	space.addShape(new SegmentShape(space.staticBody, v( 330+radius,  250+radius), v( 330+radius, -250-radius), 0)).e = 1;
	space.addShape(new SegmentShape(space.staticBody, v( 330+radius,  250+radius), v(-330-radius,  250+radius), 0)).e = 1;
	space.addShape(new SegmentShape(space.staticBody, v(-330-radius, -250-radius), v(-330-radius,  250+radius), 0)).e = 1;
	
	for(var x=-320; x<=320; x+=20){
		for(var y=-240; y<=240; y+=20){
			space.addShape(new CircleShape(space.staticBody, radius, v(x, y)));
		}
	}
	
	for(var y=10-240; y<=240; y+=40){
		var mass = 7;
		var body = space.addBody(new Body(mass, momentForCircle(mass, 0, radius, vzero)));
		body.p = v(-320, y);
		body.vx = 100;
		
		var shape = space.addShape(new CircleShape(body, radius, vzero));
		shape.e = 1;
		shape.collision_type = 2;
	}
	
	for(var x=30-320; x<=320; x+=40){
		var mass = 7;
		var body = space.addBody(new Body(mass, momentForCircle(mass, 0, radius, vzero)));
		body.p = v(x, -240);
		body.vy = 100;
		
		var shape = space.addShape(new CircleShape(body, radius, vzero));
		shape.e = 1;
		shape.collision_type = 2;
	}
	
	return space;
});

add_benchmark({name:'PyramidTopple', dt:1/180, ticks:400}, function(){
	var WIDTH = 4;
	var HEIGHT = 30;

	space = new Space();
	
	var add_domino = function(pos, flipped)
	{
		var mass = 1;
		var moment = momentForBox(mass, WIDTH, HEIGHT);
		
		var body = space.addBody(new Body(mass, moment));
		body.setPos(pos);

		var shape = (flipped ? new BoxShape(body, HEIGHT, WIDTH) : new BoxShape(body, WIDTH, HEIGHT));
		space.addShape(shape);
		shape.setElasticity(0);
		shape.setFriction(0.6);
	};

	space.iterations = 30;
	space.gravity = v(0, -300);
	space.sleepTimeThreshold = 0.5;
	space.collisionSlop = 0.5;
	
	var floor = space.addShape(new SegmentShape(space.staticBody, v(0, 0), v(640, 0), 0));
	floor.setElasticity(1);
	floor.setFriction(1);
	
	// Add the dominoes.
	var n = 12;
	for(var i=0; i<n; i++){
		for(var j=0; j<(n - i); j++){
			var offset = v(320 + (j - (n - 1 - i)*0.5)*1.5*HEIGHT, (i + 0.5)*(HEIGHT + 2*WIDTH) - WIDTH);
			add_domino(offset, false);
			add_domino(vadd(offset, v(0, (HEIGHT + WIDTH)/2)), true);
			
			if(j === 0){
				add_domino(vadd(offset, v(0.5*(WIDTH - HEIGHT), HEIGHT + WIDTH)), false);
			}
			
			if(j != n - i - 1){
				add_domino(vadd(offset, v(HEIGHT*0.75, (HEIGHT + 3*WIDTH)/2)), true);
			} else {
				add_domino(vadd(offset, v(0.5*(HEIGHT - WIDTH), HEIGHT + WIDTH)), false);
			}
		}
	}

	// Add a circle to knock the dominoes down
	var body = space.addBody(new Body(2, momentForCircle(2, 0, 5, v(0,0))));
	body.setPos(v(65, 100));
	var shape = space.addShape(new CircleShape(body, 5, v(0,0)));
	shape.setElasticity(0);
});

// TODO ideas:
// addition/removal
// Memory usage? (too small to matter?)
// http://forums.tigsource.com/index.php?topic=18077.msg518578#msg518578

var SEED = 123124;

var reset_stats = function() {
	traces = {};
	numVects = 0;
	numContacts = 0;
	numNodes = 0;
	numLeaves = 0;
	numBB = 0;
};

var run_bench = function(bench) {
	var DEFAULT_TICKS = 200;
	mersenne.seed(SEED);

	var ticks = bench.ticks || DEFAULT_TICKS;

	bench.init();

	//reset_stats();

	var start = Date.now();
	for (var s = 0; s < ticks; s++) {
		space.step(bench.dt);
	}
	var end = Date.now();
	return end - start;
};

if(typeof(print) === 'undefined') {
	var print = console.warn;
}

var bench = function(){
	for(var i = 0; i < bench_list.length; i++){
	//var i = bench_list.length - 1; {
		var bench = bench_list[i];

		print(bench.name);

		sample = new Array(9);
		for(var run = 0; run < sample.length; run++) {
			sample[run] = run_bench(bench);
			print("Run " + (run+1) + ": " + sample[run])
		}

		sample.sort();
		bench.time = (sample[3] + sample[4] + sample[5]) / 3;

		print(bench.name + " in " + bench.time + " ms");
		print();
	}


	for(var i = 0; i < bench_list.length; i++){
		var bench = bench_list[i];
		print(bench.time);
	}
};

var profile = function(){
	var time = run_bench(bench_list[bench_list.length - 1]);
	//var time = run_bench(bench_list[7], 1);

	print(time + "ms");
};

bench();
//profile();


print('vects: ' + numVects);
print('contacts: ' + numContacts);
print('node: ' + numNodes);
print('leaf: ' + numLeaves);
print('bb: ' + numBB);
print('applyImpulse: ' + numApplyImpulse);
print('applyContact: ' + numApplyContact);

print(numVects);
print(numContacts);
print(numNodes);
print(numLeaves);
print(numBB);
print(numApplyImpulse);
print(numApplyContact);


var tracesArr = [];
for(trace in traces) {
	tracesArr.push(trace);
}
tracesArr.sort(function(a, b){
	return traces[b] - traces[a];
});
for(var i = 0; i < min(10, tracesArr.length); i++){
	var t = tracesArr[i];
	print(traces[t] + ': ' + t);
}
