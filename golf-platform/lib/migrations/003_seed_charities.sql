-- Seed active charities for PRD-aligned first-run experience
-- Safe to re-run: does not duplicate existing charity names.

INSERT INTO charities (name, description, image_url, is_featured, is_active)
SELECT 'Macmillan Cancer Support', 'Helping everyone with cancer live life as fully as they can, with specialist support and practical guidance.', 'https://images.unsplash.com/photo-1469571486292-b53601020a5a?auto=format&fit=crop&w=1200&q=80', true, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE lower(name) = lower('Macmillan Cancer Support'));

INSERT INTO charities (name, description, image_url, is_featured, is_active)
SELECT 'Mind', 'Providing advice and support to empower anyone experiencing a mental health problem across England and Wales.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', true, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE lower(name) = lower('Mind'));

INSERT INTO charities (name, description, image_url, is_featured, is_active)
SELECT 'The Trussell Trust', 'Working to end the need for food banks in the UK by supporting emergency food and campaigning for long-term change.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80', false, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE lower(name) = lower('The Trussell Trust'));

INSERT INTO charities (name, description, image_url, is_featured, is_active)
SELECT 'British Heart Foundation', 'Funding life-saving cardiovascular research and supporting people living with heart and circulatory diseases.', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', false, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE lower(name) = lower('British Heart Foundation'));
