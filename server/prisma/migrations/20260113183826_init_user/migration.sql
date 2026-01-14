-- CreateTable
CREATE TABLE "users" (
    "id" CHAR(24) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "callname" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" CHAR(30) NOT NULL,
    "user_id" CHAR(24) NOT NULL,
    "account_id" CHAR(30) NOT NULL,
    "ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "device_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "session_id" CHAR(30) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" CHAR(30) NOT NULL,
    "account_id" VARCHAR(255) NOT NULL,
    "provider_id" VARCHAR(255) NOT NULL,
    "user_id" CHAR(24) NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" VARCHAR(255),
    "password" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_provider_client_ids" (
    "id" SERIAL NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSON NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_provider_client_ids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_session_id" ON "refresh_tokens"("session_id");

-- CreateIndex
CREATE INDEX "idx_accounts_user_id" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "idx_verifications_identifier" ON "user_verifications"("identifier");

-- CreateIndex
CREATE INDEX "idx_auth_provider_client_id_provider" ON "auth_provider_client_ids"("provider");

-- CreateIndex
CREATE INDEX "idx_auth_provider_client_id_client_id" ON "auth_provider_client_ids"("client_id");

-- CreateIndex
CREATE INDEX "idx_auth_provider_client_id_active" ON "auth_provider_client_ids"("active");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
