-- blooms upsert 지원: UPDATE 정책 추가
CREATE POLICY "blooms_update_public" ON blooms
  FOR UPDATE USING (true) WITH CHECK (true);
