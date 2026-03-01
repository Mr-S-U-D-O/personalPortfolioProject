import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

// Node script to load glb and check screen center
const buffer = fs.readFileSync('./models/iphone.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

// We'd need to mock DOM for GLTFLoader in node... this is too complex.
