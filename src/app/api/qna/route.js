import { NextRequest, NextResponse } from 'next/server';
import * as qna from '@tensorflow-models/qna';
import * as tf from '@tensorflow/tfjs';

// Set the backend to 'cpu' explicitly (you can also try 'webgl' or 'wasm')
tf.setBackend('cpu').then(() => {
  console.log('Backend set to CPU');
}).catch(err => {
  console.error('Error setting backend:', err);
});

// Declare the model variable
let model = null;

// Load the QnA model
const loadModel = async () => {
  if (!model) {
    console.log("Loading the model...");
    model = await qna.load();
  }
  return model;
};

// POST method to handle question and passage for QnA
export async function POST(req) {
  try {
    const { question, passage } = await req.json();

    if (!question || !passage) {
      return NextResponse.json({ error: 'Question and passage are required' }, { status: 400 });
    }

    // Load the model if it hasn't been loaded yet
    const loadedModel = await loadModel();

    // Find answers
    const answers = await loadedModel.findAnswers(question, passage);

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error processing the request', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
