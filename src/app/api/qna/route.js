import { NextRequest, NextResponse } from 'next/server';
import * as qna from '@tensorflow-models/qna';
import * as tf from '@tensorflow/tfjs';

// Import backend modules
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-cpu';

let model = null;

// Set backend with fallback
(async () => {
  try {
    await tf.setBackend('webgl');
    console.log('Backend set to WebGL');
  } catch (err) {
    console.error('Error with WebGL backend, falling back to WASM:', err);
    try {
      await tf.setBackend('wasm');
      console.log('Backend set to WASM');
    } catch (err) {
      console.error('Error with WASM backend, falling back to CPU:', err);
      await tf.setBackend('cpu');
      console.log('Backend set to CPU');
    }
  }
  await tf.ready(); // Ensure TensorFlow.js is initialized
  console.log('TensorFlow.js is ready');
})();

// Preload the model
(async () => {
  console.log("Preloading the model...");
  model = await qna.load();
  console.log("Model preloaded");
})();

// Ensure model is loaded
const ensureModel = async () => {
  if (!model) {
    console.log("Model not yet loaded, loading now...");
    model = await qna.load();
  }
  return model;
};

// Handle POST requests
export async function POST(req) {
  try {
    const { question, passage } = await req.json();

    if (!question || !passage) {
      return NextResponse.json({ error: 'Question and passage are required' }, { status: 400 });
    }

    const loadedModel = await ensureModel();
    const answers = await loadedModel.findAnswers(question, passage);

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
