#!/bin/bash

# Create the .env file from .env.example if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating the .env file..."
    cp backend/.env.example backend/.env
    echo ".env file created. Please modify it according to your needs."
else
    echo ".env file already exists."
fi


