# Secure Cloud Storage Platform

A Zero-Knowledge encrypted cloud storage platform designed to guarantee end-to-end confidentiality through client-side cryptography.

This project simulates the core functionality of modern cloud storage systems while ensuring that the server never has access to plaintext files, encryption keys, or sensitive user secrets.

---

## Features

- End-to-End Encryption (E2EE)
- Client-Side File Encryption
- Hierarchical Key Management
- Secure File & Folder Management
- Secure File Sharing using RSA-OAEP
- Certificate-Based Strong Authentication
- Challenge-Response Verification
- Password Change without File Re-encryption
- AES-GCM Authenticated Encryption
- Recovery Key Mechanism
- ZIP Multi-Download Support
- Storage Quota Management
- Zero-Knowledge Architecture

---

# Zero-Knowledge Architecture

The platform follows a **Zero-Knowledge** model:

- Files are encrypted locally before upload
- The server never sees plaintext data
- Encryption keys never leave the client in clear form
- Even a compromised server cannot decrypt user files

This guarantees **structural confidentiality**, not just contractual trust.

---

# System Architecture

The platform is built around three core modules:

- **User Management**
- **Cryptographic Key Management**
- **File & Folder Management**

---

# Cryptographic Key Hierarchy

The system uses a layered key hierarchy to isolate compromises and improve security.

```text
Password
   ↓ PBKDF2
KEK (Key Encryption Key)
   ↓ decrypts
RMK (Random Master Key)
   ↓ decrypts
FK (File Key)
   ↓ encrypts
Files (AES-GCM)
```

---

# Key Types

## 1. KEK : Key Encryption Key

Derived from the user's password using:

- PBKDF2
- Random Salt
- High Iteration Count

### Responsibilities

- Encrypts the RMK
- Never stored permanently
- Recomputed during authentication

---

## 2. RMK : Random Master Key

Randomly generated using a CSPRNG.

### Responsibilities

- Encrypts all File Keys
- Root cryptographic key of the system
- Stored only in encrypted form

---

## 3. FK : File Key

Each file receives its own dedicated encryption key.

### Responsibilities

- Encrypts files using AES-GCM
- Ensures cryptographic isolation between files

---

## 4. Session Key

Temporary key generated during authentication.

### Responsibilities

- Keeps RMK available during the session
- Destroyed on logout or session expiration

---

## 5. Recovery Key

Generated during account creation.

### Responsibilities

- Recovers encrypted RMK
- Recovers encrypted RSA private key
- Allows account recovery in Zero-Knowledge mode

 If lost, encrypted files may become permanently inaccessible.

---

# File Encryption

## AES-GCM

Files are encrypted client-side using:

- AES-GCM
- Unique IV per encryption
- Authentication Tag

### Why AES-GCM?

- Confidentiality
- Integrity
- Authentication
- Resistance against tampering
- Protection against padding oracle attacks

---

# Secure File Sharing

The platform supports secure sharing without breaking the Zero-Knowledge model.

## Hybrid Encryption Model

### Symmetric Encryption

- Files are encrypted using AES-GCM
- Each file has a dedicated FK

### Asymmetric Encryption

When sharing a file:

1. The owner decrypts the FK locally
2. The FK is encrypted with the recipient’s RSA public key
3. The encrypted FK is sent to the server
4. The recipient decrypts the FK using their RSA private key

At no point does the server access plaintext keys.

---

# RSA-OAEP Sharing Flow

```text
Owner
  ↓
Decrypt FK locally
  ↓
Encrypt FK with recipient RSA Public Key
  ↓
Send encrypted FK to server
  ↓
Recipient decrypts FK with RSA Private Key
  ↓
Decrypt file locally
```

---

# Strong Identification System

To prevent MITM attacks during sharing, the platform integrates:

- MiniCertificates
- Digital Signatures
- Challenge-Response Authentication

---

# MiniCertificates

At registration:

1. User generates RSA signing keys
2. Public signing key is sent to server
3. Server signs user metadata
4. A MiniCertificate is generated

The certificate links:

- User identity
- Email
- Public signature key

---

# Challenge-Response Protocol

Before any file sharing operation:

## Step 1 : Challenge Generation

The server generates:

- Nonce
- Challenge ID

## Step 2 : Client Signature

The client signs:

- Nonce
- Challenge ID
- User identity
- Timestamp

using its private signing key.

## Step 3 : Verification

The server verifies:

- Signature validity
- Challenge freshness
- Certificate authenticity
- Identity ownership

This proves possession of the private key.

---

# Security Properties

## Confidentiality

Files are encrypted before upload.

## Integrity

AES-GCM authentication tags prevent unauthorized modifications.

## Isolation

Compromising one file key does not affect other files.

## Strong Authentication

Challenge-response prevents identity spoofing.

## Zero-Trust Model

No entity including the server is implicitly trusted.

---

# File System Features

## Folder Structure

- Hierarchical tree architecture
- Recursive deletion
- File/folder move support
- Unique names per directory
- Parent-child references

---

# Upload Features

Supports:

- Multiple file uploads
- Folder uploads
- Preserving directory hierarchy

Each file is encrypted individually before upload.

---

# Download Features

Supports:

- Single file download
- Multi-file download
- Automatic ZIP generation client-side

Files are decrypted locally before ZIP packaging.

---

# Password Change Workflow

Changing the password does NOT require re-encrypting files.

### Workflow

1. Old password derives current KEK
2. KEK decrypts RMK
3. New password derives new KEK
4. RMK is re-encrypted using new KEK

### Result

- File Keys remain unchanged
- Files remain accessible
- Efficient password rotation

---

# Storage Quotas

The system includes quota management:

- Maximum storage per user
- Real-time storage tracking
- Recursive quota updates
- Shared files counted only once

---

# Cryptographic Standards

## Algorithms

- AES-GCM
- RSA-OAEP (SHA-256)
- PBKDF2
- bcrypt
- JWT
- TLS

## Security Concepts

- Zero-Knowledge Architecture
- End-to-End Encryption
- Hybrid Encryption
- Challenge-Response Authentication
- Hierarchical Key Management

---

This project was developed as part of a cryptography and secure systems focused on:

- Cloud storage security
- Applied cryptography
- Zero-Knowledge systems
- Secure sharing architectures

# Security Note

In the current implementation, the server acts as a lightweight Certificate Authority (Mini-CA) responsible for generating and verifying MiniCertificates.

For a production-grade architecture, the Certificate Authority should be deployed on a **separate trusted server** isolated from the storage infrastructure. This separation reduces the risk of certificate forgery in case the main storage server is compromised and strengthens the trust model of the platform.
