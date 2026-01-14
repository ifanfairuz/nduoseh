# Panah Server

The Panah Server is a REST API for the Panah application.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Key Generation](#key-generation)
  - [Enviroment Variables](#enviroment-variables)
  - [Installation](#installation)
  - [Application Configuration](#application-configuration)
  - [Building the Application](#building-the-application)
  - [Running the Application](#running-the-application)

## Overview

The Panah Server is a REST API for the Panah application.

## Getting Started

### Prerequisites

Before you can start using the Kai Server, you need to have the following prerequisites installed:

- Node.js (v22.x or higher)
- PostgreSQL (v14.x or higher)
- Redis (v6.x or higher)

### Key Generation

The Kai Server require keypair for encryption and decryption. You can generate the keypair using the following command:

```bash
# generate random passphrase
export PRIVATE_KEY_PASSPHRASE="$(openssl rand -base64 32)"

# generate private key 4096-bit encrypted with AES-256-CBC on PEM using passphrase
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -aes-256-cbc -pass pass:"$PRIVATE_KEY_PASSPHRASE" -out pkey.pem

# extract public key (unencrypted)
openssl rsa -in pkey.pem -passin pass:"$PRIVATE_KEY_PASSPHRASE" -pubout -out pubkey.pem

# set file permissions (root/run-as-user)
chmod 600 pkey.pem
chmod 644 pubkey.pem

# echo passphrase to use in .env
echo "\nPRIVATE_KEY_PASSPHRASE=$PRIVATE_KEY_PASSPHRASE" >> .env

# (opsional) unset passphrase env var after use
unset PRIVATE_KEY_PASSPHRASE
```

### Enviroment Variables

see [.env.example](.env.example) for the list of required environment variables.

### Installation

To install the Kai Server, you can use the following command:

```bash
npm install
```

This will install all the required dependencies for the Kai Server.

### Application Configuration

You can configure the Kai Server by creating a `config.json` file in the root directory of the project. The `config.json` file should contain the properties for the application configuration.

Use https://kai-team.github.io/public/kai-server/config.schema.json

```json
{
  "$schema": "https://kai-team.github.io/public/kai-server/config.schema.json",
  "admin": false,
  "auth": {
    "strategies": ["google"]
  }
}
```

### Building the Application

To build the Kai Server, you can use the following command:

```bash
npm run build
```

This will build the Kai Server and generate the necessary files for deployment.

### Running the Application

To run the Kai Server, you can use the following command:

```bash
npm run start
```

This will start the Kai Server

Open your browser and navigate to http://localhost:3000/doc to access the Swagger UI.
