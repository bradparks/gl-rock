var Set = require('es6-set');
var vec3 = require('gl-vec3');

function getNeighbours(positions, cells) {

    console.log("NEIGHT");

    
    /*
     adjacentVertices[i] contains a set containing all the indices of the neighbours of the vertex with
     index i.
     A set is used because it makes the algorithm more convenient.
     */
    var adjacentVertices = new Array(positions.length);

    
    /*
     adjacentFaces[i] Contains all faces that are adjacent to the vertex with index i.
     */
    var adjacentFaces = new Array(positions.length);

    // go through all faces.
    for(var iCell = 0; iCell < cells.length; ++iCell) {

        var cellPositions = cells[iCell];


        function wrap(i) {
            if(i < 0) {
                return cellPositions.length + i;
            } else {
                return i % cellPositions.length;
            }
        }

        // go through all the points of the face.
        for (var iPosition = 0; iPosition < cellPositions.length; ++iPosition) {

            // the neighbours of this points are the previous and next points(in the array)
            var cur = cellPositions[wrap(iPosition+0)];
            var prev = cellPositions[wrap(iPosition-1)];
            var next = cellPositions[wrap(iPosition+1)];

            // create set on the fly if necessary.
            if(typeof adjacentVertices[cur] === 'undefined') {
                adjacentVertices[cur] = new Set();
            }
            if(typeof adjacentFaces[cur] === 'undefined') {
                adjacentFaces[cur] = [];
            }

            // add adjacent vertices.
            adjacentVertices[cur].add(prev);
            adjacentVertices[cur].add(next);

            // add adjacent faces.
            adjacentFaces[cur].push(iCell);

        }
    }

    // now we convert adjacentVertices from an array of sets, to an array of arrays.
    for(var i = 0; i < positions.length; ++i) {
        adjacentVertices[i] =  Array.from(adjacentVertices[i]);
    }

    return {adjacentVertices: adjacentVertices, adjacentFaces: adjacentFaces};
}

/*
Projects the point `p` onto the plane defined by the normal `n` and the point `r0`
 */
function project(n, r0, p) {
    // For an explanation of the math, see http://math.stackexchange.com/a/100766

    var scratchVec = vec3.create();
    var t = vec3.dot(  n,  vec3.subtract(scratchVec, r0, p)  ) /  vec3.dot(n,n);

    var projectedP = vec3.create();
    vec3.copy(projectedP, p);
    vec3.scaleAndAdd(projectedP, projectedP, n, t);

    return projectedP;
}


// scrape at vertex with index `positionIndex`.
function scrape(positionIndex, positions, cells, normals, adjacentVertices, adjacentFaces, strength, radius) {

    var traversed = new Array(positions.length);
    for(var i = 0; i < positions.length; ++i) {
        traversed[i] = false;
    }



    var centerPosition = positions[positionIndex];

    // to scrape, we simply project all vertices that are close to `centerPosition`
    // onto a plane. The equation of this plane is given by dot(n, r-r0) = 0,
    // where n is the plane normal, r0 is a point on the plane(in our case we set this to be the projected center),
    // and r is some arbitrary point on the plane.
    var n = normals[positionIndex];

    var r0 = vec3.create();
    vec3.copy(r0, centerPosition);
    vec3.scaleAndAdd(r0, r0, n, -strength);

    var stack = [];
    stack.push(positionIndex);

    var count = 0;

    var borderVertices = [];

    while(stack.length > 0) {

        var topIndex = stack.pop();

        if(traversed[topIndex])
            continue; // already traversed; look at next element in stack.
        traversed[topIndex] = true;

        var topPosition = positions[topIndex];
        // project onto plane.
        var p = vec3.create();
        vec3.copy(p, topPosition);


        var projectedP = project(n, r0, p);


        ++count;
        if(vec3.squaredDistance(projectedP, r0) < radius) {

            positions[topIndex] = projectedP;
            normals[topIndex] = n;
        } else {

            /*
            borderVertices.push(topIndex);

            var neighbourIndices = adjacentVertices[topIndex];
            for(var i = 0; i < neighbourIndices.length; ++i) {
                borderVertices.push(neighbourIndices[i]);
            }*/


            continue;
        }

        //normals[topIndex] = [0,0,0];



        var neighbourIndices = adjacentVertices[topIndex];
        for(var i = 0; i < neighbourIndices.length; ++i) {
            stack.push(neighbourIndices[i]);
        }

    }

    /*
    console.log("normal bla: n", n);

    // fix normals on border:
    borderFaceNormals = [];

    for(var i = 0; i < borderVertices.length; ++i) {
        var adjFaces = adjacentFaces[borderVertices[i]];

        //  console.log("adj: ", adjFaces);


        for(var j = 0; j < adjFaces.length; ++j) {
            //console.log("faces ", i, adjFaces[j]);
            var face = cells[adjFaces[j]];


            if(!(typeof borderFaceNormals[adjFaces[j]] === 'undefined')) {
                // console.log("CONTINUE");
                continue;
            }


            // console.log("face ", i, face);

            var p0 = positions[face[0]];
            var p1 = positions[face[1]];
            var p2 = positions[face[2]];

            var v1 = vec3.create();
            vec3.subtract(v1, p0, p1);

            var v2 = vec3.create();
            vec3.subtract(v2, p2, p1);

            var n = vec3.create();
            vec3.cross(n, v2, v1);
            vec3.normalize(n,n);

            //  console.log("n ", n);
            borderFaceNormals[adjFaces[j]] = n;
        }


        // compute normals of every face.
    }

    // console.log("borderFaceNormals ", borderFaceNormals);



    for(var i = 0; i < borderVertices.length; ++i) {
        var adjFaces = adjacentFaces[borderVertices[i]];

        var n = vec3.create();

        for (var j = 0; j < adjFaces.length; ++j) {
            // console.log("faces ", i, adjFaces[j]);

            // console.log("normal: ", borderFaceNormals[adjFaces[j]]);

            vec3.add(n,n,borderFaceNormals[adjFaces[j]]);

            //console.log("n: ", i, n);
        }
        vec3.scale(n,n,1.0/adjFaces.length);
        vec3.normalize(n,n);

        //    normals[borderVertices[i]] = n;
    }
*/

    //console.log("border vertices ", borderVertices);


}

/*


 */


module.exports.getNeighbours = getNeighbours;
module.exports.scrape = scrape;

