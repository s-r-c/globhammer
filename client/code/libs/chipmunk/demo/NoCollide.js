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

var a, b;
var noCollide_begin = function(arb, space){
	console.log(arb.a.space.stamp);
	console.log(arb.body_a, arb.body_b);
	console.log(a.p.x % 40, b.p.y % 40);
	throw new Error('Should not get here');
};

var NoCollide = function()
{
	Demo.call(this);

	var space = this.space;
	
	space.iterations = 1;
	
	space.addCollisionHandler(2, 2, noCollide_begin, null, null, null, null);
	
	var radius = 4.5;
	
	space.addShape(new cp.SegmentShape(space.staticBody, v(-10-radius, -10-radius), v( 650+radius, -10-radius), 0)).e = 1;
	space.addShape(new cp.SegmentShape(space.staticBody, v( 650+radius,  490+radius), v( 650+radius, -10-radius), 0)).e = 1;
	space.addShape(new cp.SegmentShape(space.staticBody, v( 650+radius,  490+radius), v(-10-radius,  490+radius), 0)).e = 1;
	space.addShape(new cp.SegmentShape(space.staticBody, v(-10-radius, -10-radius), v(-10-radius,  490+radius), 0)).e = 1;
	
	for(var x=0; x<=640; x+=20){
		for(var y=0; y<=480; y+=20){
			space.addShape(new cp.CircleShape(space.staticBody, radius, v(x, y)));
		}
	}
	
	for(var y=10; y<=480; y+=40){
		var mass = 7;
		var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0,0))));
		body.setPos(v(0.001, y));
		body.vx = 100;
		
		var shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
		shape.e = 1;
		shape.collision_type = 2;

		a = body;

		break;
	}
	
	for(var x=30; x<=640; x+=40){
		var mass = 7;
		var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0,0))));
		body.setPos(v(x, 0.001));
		body.vy = 100;
		
		var shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
		shape.e = 1;
		shape.collision_type = 2;

		b = body;

		break;
	}

//	for(var i = 0; i < 6630; i++) {
	for(var i = 0; i < 100000; i++) {
		if (i % 30 === 0) {
			var ax = a.p.x, by = b.p.y;
			console.log(i, ax, by);
			//console.log((ax - by) % 40, (ax + by) % 40);
		}
		space.step(1/60);
	}
	console.log('aa');
};

NoCollide.prototype = Object.create(Demo.prototype);

NoCollide.prototype.draw = function(){};

addDemo('NoCollide', NoCollide);

