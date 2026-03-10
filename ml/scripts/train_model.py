"""
Plant Disease Detection - CNN Model Training Script
Uses ResNet50 transfer learning for plant disease classification
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
import numpy as np
import os
from datetime import datetime
import json
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Configuration
class Config:
    # Data paths
    DATA_DIR = "data/plant_disease_dataset"
    TRAIN_DIR = os.path.join(DATA_DIR, "train")
    VAL_DIR = os.path.join(DATA_DIR, "val")
    TEST_DIR = os.path.join(DATA_DIR, "test")
    
    # Model paths
    MODEL_DIR = "models"
    CHECKPOINT_DIR = os.path.join(MODEL_DIR, "checkpoints")
    
    # Training parameters
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 50
    LEARNING_RATE = 0.001
    
    # Model parameters
    NUM_CLASSES = 38  # Adjust based on your dataset
    
    # Data augmentation
    AUGMENTATION = True
    
    # Device
    DEVICE = '/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'

def create_data_generators(config):
    """
    Create data generators for training, validation, and testing
    """
    if config.AUGMENTATION:
        # Training data augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )
    else:
        train_datagen = ImageDataGenerator(rescale=1./255)
    
    # Validation and test data (no augmentation)
    val_test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        config.TRAIN_DIR,
        target_size=config.IMG_SIZE,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_test_datagen.flow_from_directory(
        config.VAL_DIR,
        target_size=config.IMG_SIZE,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    test_generator = val_test_datagen.flow_from_directory(
        config.TEST_DIR,
        target_size=config.IMG_SIZE,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator, test_generator

def build_model(config):
    """
    Build CNN model using ResNet50 transfer learning
    """
    # Load pre-trained ResNet50
    base_model = ResNet50(
        include_top=False,
        weights='imagenet',
        input_shape=(*config.IMG_SIZE, 3)
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Build model
    inputs = keras.Input(shape=(*config.IMG_SIZE, 3))
    
    # Preprocessing
    x = keras.applications.resnet50.preprocess_input(inputs)
    
    # Base model
    x = base_model(x, training=False)
    
    # Global pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Dense layers
    x = layers.Dense(512, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    
    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    # Output layer
    outputs = layers.Dense(config.NUM_CLASSES, activation='softmax')(x)
    
    # Create model
    model = keras.Model(inputs, outputs, name='plant_disease_classifier')
    
    return model, base_model

def compile_model(model, learning_rate):
    """
    Compile the model
    """
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    return model

def create_callbacks(config):
    """
    Create training callbacks
    """
    callbacks = []
    
    # Model checkpoint
    checkpoint = ModelCheckpoint(
        filepath=os.path.join(config.CHECKPOINT_DIR, 'model_epoch_{epoch:02d}_val_acc_{val_accuracy:.4f}.h5'),
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    callbacks.append(checkpoint)
    
    # Early stopping
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    )
    callbacks.append(early_stop)
    
    # Reduce learning rate on plateau
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
    callbacks.append(reduce_lr)
    
    # TensorBoard
    log_dir = os.path.join("logs", datetime.now().strftime("%Y%m%d-%H%M%S"))
    tensorboard = TensorBoard(log_dir=log_dir, histogram_freq=1)
    callbacks.append(tensorboard)
    
    return callbacks

def train_model(model, train_gen, val_gen, config, callbacks):
    """
    Train the model
    """
    print("Starting training...")
    print(f"Training samples: {train_gen.samples}")
    print(f"Validation samples: {val_gen.samples}")
    print(f"Batch size: {config.BATCH_SIZE}")
    print(f"Steps per epoch: {train_gen.samples // config.BATCH_SIZE}")
    
    history = model.fit(
        train_gen,
        epochs=config.EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def fine_tune_model(model, base_model, train_gen, val_gen, config, callbacks):
    """
    Fine-tune the model by unfreezing some layers
    """
    print("\nFine-tuning model...")
    
    # Unfreeze the top layers of the base model
    base_model.trainable = True
    
    # Freeze all layers except the last 20
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model = compile_model(model, learning_rate=config.LEARNING_RATE / 10)
    
    # Continue training
    history_fine = model.fit(
        train_gen,
        epochs=20,  # Additional epochs for fine-tuning
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    return history_fine

def evaluate_model(model, test_gen, class_names):
    """
    Evaluate model on test set
    """
    print("\nEvaluating model...")
    
    # Get predictions
    test_gen.reset()
    predictions = model.predict(test_gen, verbose=1)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_gen.classes
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(
        true_classes,
        predicted_classes,
        target_names=class_names
    ))
    
    # Confusion matrix
    cm = confusion_matrix(true_classes, predicted_classes)
    
    # Plot confusion matrix
    plt.figure(figsize=(20, 16))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names,
                yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("Confusion matrix saved to confusion_matrix.png")
    
    # Calculate metrics
    test_loss, test_accuracy, top_3_accuracy = model.evaluate(test_gen, verbose=1)
    
    return {
        'test_loss': float(test_loss),
        'test_accuracy': float(test_accuracy),
        'top_3_accuracy': float(top_3_accuracy)
    }

def plot_training_history(history, history_fine=None):
    """
    Plot training history
    """
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy plot
    axes[0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0].plot(history.history['val_accuracy'], label='Val Accuracy')
    
    if history_fine:
        offset = len(history.history['accuracy'])
        axes[0].plot(range(offset, offset + len(history_fine.history['accuracy'])),
                    history_fine.history['accuracy'], label='Fine-tune Train Accuracy')
        axes[0].plot(range(offset, offset + len(history_fine.history['val_accuracy'])),
                    history_fine.history['val_accuracy'], label='Fine-tune Val Accuracy')
    
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].set_title('Model Accuracy')
    axes[0].legend()
    axes[0].grid(True)
    
    # Loss plot
    axes[1].plot(history.history['loss'], label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Val Loss')
    
    if history_fine:
        offset = len(history.history['loss'])
        axes[1].plot(range(offset, offset + len(history_fine.history['loss'])),
                    history_fine.history['loss'], label='Fine-tune Train Loss')
        axes[1].plot(range(offset, offset + len(history_fine.history['val_loss'])),
                    history_fine.history['val_loss'], label='Fine-tune Val Loss')
    
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].set_title('Model Loss')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300)
    print("Training history saved to training_history.png")

def save_model_and_metadata(model, train_gen, config, metrics):
    """
    Save model and metadata
    """
    # Create model directory
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    
    # Save model
    model_path = os.path.join(config.MODEL_DIR, 'plant_disease_model.h5')
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
    # Save class names
    class_names = list(train_gen.class_indices.keys())
    class_names_path = os.path.join(config.MODEL_DIR, 'class_names.json')
    with open(class_names_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    print(f"Class names saved to {class_names_path}")
    
    # Save metadata
    metadata = {
        'model_version': '1.0.0',
        'created_at': datetime.now().isoformat(),
        'num_classes': config.NUM_CLASSES,
        'image_size': config.IMG_SIZE,
        'architecture': 'ResNet50 Transfer Learning',
        'training_params': {
            'batch_size': config.BATCH_SIZE,
            'epochs': config.EPOCHS,
            'learning_rate': config.LEARNING_RATE,
            'optimizer': 'Adam'
        },
        'performance': metrics,
        'class_names': class_names
    }
    
    metadata_path = os.path.join(config.MODEL_DIR, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {metadata_path}")

def main():
    """
    Main training pipeline
    """
    # Create config
    config = Config()
    
    # Create directories
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    os.makedirs(config.CHECKPOINT_DIR, exist_ok=True)
    
    print("Plant Disease Detection - Model Training")
    print("=" * 50)
    print(f"Device: {config.DEVICE}")
    print(f"Image size: {config.IMG_SIZE}")
    print(f"Batch size: {config.BATCH_SIZE}")
    print(f"Epochs: {config.EPOCHS}")
    print("=" * 50)
    
    # Create data generators
    print("\nCreating data generators...")
    train_gen, val_gen, test_gen = create_data_generators(config)
    
    # Update num_classes based on actual data
    config.NUM_CLASSES = train_gen.num_classes
    print(f"Number of classes: {config.NUM_CLASSES}")
    
    # Build model
    print("\nBuilding model...")
    model, base_model = build_model(config)
    model = compile_model(model, config.LEARNING_RATE)
    
    # Print model summary
    print("\nModel Summary:")
    model.summary()
    
    # Create callbacks
    callbacks = create_callbacks(config)
    
    # Train model
    history = train_model(model, train_gen, val_gen, config, callbacks)
    
    # Fine-tune model
    history_fine = fine_tune_model(model, base_model, train_gen, val_gen, config, callbacks)
    
    # Evaluate model
    class_names = list(train_gen.class_indices.keys())
    metrics = evaluate_model(model, test_gen, class_names)
    
    # Plot training history
    plot_training_history(history, history_fine)
    
    # Save model and metadata
    save_model_and_metadata(model, train_gen, config, metrics)
    
    print("\nTraining complete!")
    print(f"Test Accuracy: {metrics['test_accuracy']:.4f}")
    print(f"Top-3 Accuracy: {metrics['top_3_accuracy']:.4f}")

if __name__ == "__main__":
    main()
