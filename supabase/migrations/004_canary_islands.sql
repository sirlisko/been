-- world-map-country-shapes 2.0 folds the Canary Islands (IC, not an ISO code)
-- into Spain, so anyone who tapped them has been to ES
insert into user_countries (user_id, code)
select user_id, 'ES' from user_countries where code = 'IC'
on conflict (user_id, code) do nothing;

delete from user_countries where code = 'IC';
