-- Initial faculty codes for Weekly Live Exam.
-- Additive and safe to run more than once.
insert into public.live_exam_faculties (faculty_code, faculty_name, is_active)
values
  ('NHPC','Dental Hygienist (NHPC)',true),
  ('BMLT','Bachelor in Medical Laboratory Technology (BMLT)',true),
  ('MLT','Medical Laboratory Technology (MLT)',true),
  ('HA','Health Assistant (HA)',true),
  ('RAD','Radiography',true),
  ('RT','Radiotherapy',true),
  ('OTT','Operation Theatre Technology (OTT)',true),
  ('ANES','Anaesthesia Technology',true),
  ('OPH','Ophthalmic Science',true),
  ('PT','Physiotherapy',true),
  ('DHA','Dental Hygienist (DHA Preparation)',true),
  ('LOK','Loksewa – Dental Hygienist',true),
  ('DPHARM','Diploma in Pharmacy',true),
  ('BPHARM','Bachelor of Pharmacy',true)
on conflict (faculty_code) do update
set faculty_name = excluded.faculty_name,
    is_active = excluded.is_active;
