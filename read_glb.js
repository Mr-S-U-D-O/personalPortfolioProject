const fs = require('fs');
try {
    const buf = fs.readFileSync('models/iphone.glb');
    const magic = buf.toString('utf8', 0, 4);
    if (magic !== 'glTF') throw new Error('Not GLB');
    const chunkLen = buf.readUInt32LE(12);
    const chunkType = buf.toString('utf8', 16, 20);
    if (chunkType !== 'JSON') throw new Error('Not JSON');
    const jsonStr = buf.toString('utf8', 20, 20 + chunkLen);
    const gltf = JSON.parse(jsonStr);
    
    console.log("--- Nodes ---");
    gltf.nodes.forEach((n, i) => console.log(`Node ${i}: ${n.name}`));
    
    console.log("\n--- Materials ---");
    gltf.materials.forEach((m, i) => console.log(`Material ${i}: ${m.name}`));
} catch (e) {
    console.error(e);
}
