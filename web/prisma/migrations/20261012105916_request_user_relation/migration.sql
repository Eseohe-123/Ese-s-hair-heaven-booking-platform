-- AddForeignKey
ALTER TABLE "style_request" ADD CONSTRAINT "style_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
