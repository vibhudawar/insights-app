-- CreateIndex
CREATE INDEX "boards_creator_id_idx" ON "public"."boards"("creator_id");

-- CreateIndex
CREATE INDEX "feature_requests_board_id_idx" ON "public"."feature_requests"("board_id");

-- CreateIndex
CREATE INDEX "feature_requests_status_idx" ON "public"."feature_requests"("status");

-- CreateIndex
CREATE INDEX "feature_requests_created_at_idx" ON "public"."feature_requests"("created_at");

-- CreateIndex
CREATE INDEX "feature_requests_upvote_count_idx" ON "public"."feature_requests"("upvote_count");

-- CreateIndex
CREATE INDEX "feature_requests_board_id_status_idx" ON "public"."feature_requests"("board_id", "status");

-- CreateIndex
CREATE INDEX "feature_requests_board_id_upvote_count_idx" ON "public"."feature_requests"("board_id", "upvote_count");

-- CreateIndex
CREATE INDEX "upvotes_feature_request_id_idx" ON "public"."upvotes"("feature_request_id");

-- CreateIndex
CREATE INDEX "upvotes_user_identifier_idx" ON "public"."upvotes"("user_identifier");
