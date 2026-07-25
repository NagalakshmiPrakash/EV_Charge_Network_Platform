/*
# EV Charge Network — Seed Demo Data (public-read tables)

## Overview
Seeds realistic charging stations and chargers so the locator works immediately
without sign-in. Reviews are handled client-side as static demo content (reviews
table requires a FK to auth.users via profiles, so static seed reviews are not viable).

## Data
- 12 stations across major Indian cities
- ~39 chargers (mix of CCS, CHAdeMO, Type2, Tesla, GB/T; available/occupied/offline/maintenance)

## Safety
- Uses ON CONFLICT DO NOTHING so re-running is idempotent.
*/

INSERT INTO public.stations (id, name, description, address, city, latitude, longitude, is_24_hours, amenities, photo_url, rating, total_ratings, is_active, owner_id) VALUES
('a0000001-0000-0000-0000-000000000001','VoltHub Bandra','Premium fast-charging hub near Bandra-Worli Sea Link. Cafe and lounge on-site.','Linking Road, Bandra West','Mumbai',19.0596,72.8295,true,ARRAY['Cafe','Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.7,128,true,NULL),
('a0000001-0000-0000-0000-000000000002','GreenCharge Powai','Corporate park charging station with covered parking and 24/7 access.','Hiranandani Business Park, Powai','Mumbai',19.1176,72.9060,true,ARRAY['Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.3,76,true,NULL),
('a0000001-0000-0000-0000-000000000003','ElectroStop Connaught Place','Central Delhi ultra-fast charging with retail and food court nearby.','Connaught Place, Inner Circle','Delhi',28.6315,77.2167,true,ARRAY['Cafe','Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.5,203,true,NULL),
('a0000001-0000-0000-0000-000000000004','ChargePoint Noida','Sector 62 charging station serving the IT corridor.','Block B, Sector 62','Delhi',28.6253,77.3716,false,ARRAY['Parking','Restroom','WiFi'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.1,54,true,NULL),
('a0000001-0000-0000-0000-000000000005','PowerDrive Koramangala','Bangalore tech district fast chargers with cafe lounge.','5th Block, Koramangala','Bangalore',12.9352,77.6245,true,ARRAY['Cafe','Parking','Restroom','WiFi'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.8,167,true,NULL),
('a0000001-0000-0000-0000-000000000006','WattHub Whitefield','ITPL tech park charging hub with multiple connector types.','Whitefield Main Road','Bangalore',12.9698,77.7500,true,ARRAY['Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.2,89,true,NULL),
('a0000001-0000-0000-0000-000000000007','EcoCharge Hinjewadi','Pune IT park charging with solar-powered canopy.','Rajiv Gandhi Infotech Park, Hinjewadi','Pune',18.5912,73.7389,true,ARRAY['Parking','Restroom','WiFi','Cafe'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.6,112,true,NULL),
('a0000001-0000-0000-0000-000000000008','ZapStation Koregaon Park','Premium charging near Koregaon Park with luxury amenities.','Koregaon Park, Lane 5','Pune',18.5362,73.8939,true,ARRAY['Cafe','Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.4,67,true,NULL),
('a0000001-0000-0000-0000-000000000009','VoltStation Hitech City','Hyderabad cyber valley ultra-fast hub with lounge.','HITEC City, Madhapur','Hyderabad',17.4435,78.3772,true,ARRAY['Cafe','Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.7,143,true,NULL),
('a0000001-0000-0000-0000-000000000010','ChargeZone Gachibowli','Sports village charging with multi-connector support.','Gachibowli, Financial District','Hyderabad',17.4401,78.3489,false,ARRAY['Parking','Restroom','WiFi'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.0,41,true,NULL),
('a0000001-0000-0000-0000-000000000011','ElectroPark OMR','Chennai OMR IT corridor fast charging with 24/7 access.','OMR, Sholinganallur','Chennai',12.9010,80.2279,true,ARRAY['Parking','Restroom','WiFi','Cafe'],'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',4.3,78,true,NULL),
('a0000001-0000-0000-0000-000000000012','GreenVolt Anna Salai','Central Chennai charging hub with retail complex.','Anna Salai, Teynampet','Chennai',13.0367,80.2475,true,ARRAY['Cafe','Parking','Restroom','WiFi','Shopping'],'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg',4.5,95,true,NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chargers (id, station_id, label, connector_type, power_kw, status, price_per_kwh, is_free) VALUES
('b1000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000001','CCS-01','CCS',150.0,'available',18.50,false),
('b1000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000001','CCS-02','CCS',150.0,'occupied',18.50,false),
('b1000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000001','CHAdeMO-01','CHAdeMO',50.0,'available',15.00,false),
('b1000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000001','Type2-01','Type2',22.0,'available',8.00,true),
('b1000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000002','CCS-01','CCS',100.0,'available',17.00,false),
('b1000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000002','Type2-01','Type2',7.4,'occupied',6.00,false),
('b1000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000002','CCS-02','CCS',100.0,'offline',17.00,false),
('b1000001-0000-0000-0000-000000000008','a0000001-0000-0000-0000-000000000003','CCS-Ultra-01','CCS',350.0,'available',25.00,false),
('b1000001-0000-0000-0000-000000000009','a0000001-0000-0000-0000-000000000003','CCS-Ultra-02','CCS',350.0,'available',25.00,false),
('b1000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000003','Tesla-01','Tesla',250.0,'occupied',28.00,false),
('b1000001-0000-0000-0000-000000000011','a0000001-0000-0000-0000-000000000003','Type2-01','Type2',22.0,'available',9.00,false),
('b1000001-0000-0000-0000-000000000012','a0000001-0000-0000-0000-000000000004','CCS-01','CCS',60.0,'available',16.00,false),
('b1000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000004','GB/T-01','GB/T',50.0,'available',14.00,false),
('b1000001-0000-0000-0000-000000000014','a0000001-0000-0000-0000-000000000004','Type2-01','Type2',7.4,'maintenance',6.00,false),
('b1000001-0000-0000-0000-000000000015','a0000001-0000-0000-0000-000000000005','CCS-01','CCS',150.0,'available',19.00,false),
('b1000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000005','CCS-02','CCS',150.0,'occupied',19.00,false),
('b1000001-0000-0000-0000-000000000017','a0000001-0000-0000-0000-000000000005','Type2-01','Type2',22.0,'available',9.00,true),
('b1000001-0000-0000-0000-000000000018','a0000001-0000-0000-0000-000000000005','CHAdeMO-01','CHAdeMO',50.0,'available',15.00,false),
('b1000001-0000-0000-0000-000000000019','a0000001-0000-0000-0000-000000000006','CCS-01','CCS',120.0,'available',18.00,false),
('b1000001-0000-0000-0000-000000000020','a0000001-0000-0000-0000-000000000006','CCS-02','CCS',120.0,'offline',18.00,false),
('b1000001-0000-0000-0000-000000000021','a0000001-0000-0000-0000-000000000006','Type2-01','Type2',22.0,'available',8.50,false),
('b1000001-0000-0000-0000-000000000022','a0000001-0000-0000-0000-000000000007','CCS-01','CCS',150.0,'available',17.50,false),
('b1000001-0000-0000-0000-000000000023','a0000001-0000-0000-0000-000000000007','CCS-02','CCS',150.0,'available',17.50,false),
('b1000001-0000-0000-0000-000000000024','a0000001-0000-0000-0000-000000000007','Type2-01','Type2',22.0,'occupied',8.00,true),
('b1000001-0000-0000-0000-000000000025','a0000001-0000-0000-0000-000000000008','CCS-01','CCS',100.0,'available',20.00,false),
('b1000001-0000-0000-0000-000000000026','a0000001-0000-0000-0000-000000000008','CCS-02','CCS',100.0,'occupied',20.00,false),
('b1000001-0000-0000-0000-000000000027','a0000001-0000-0000-0000-000000000008','CHAdeMO-01','CHAdeMO',50.0,'available',16.00,false),
('b1000001-0000-0000-0000-000000000028','a0000001-0000-0000-0000-000000000009','CCS-Ultra-01','CCS',350.0,'available',24.00,false),
('b1000001-0000-0000-0000-000000000029','a0000001-0000-0000-0000-000000000009','CCS-01','CCS',150.0,'occupied',20.00,false),
('b1000001-0000-0000-0000-000000000030','a0000001-0000-0000-0000-000000000009','Type2-01','Type2',22.0,'available',9.00,false),
('b1000001-0000-0000-0000-000000000031','a0000001-0000-0000-0000-000000000009','Tesla-01','Tesla',250.0,'available',27.00,false),
('b1000001-0000-0000-0000-000000000032','a0000001-0000-0000-0000-000000000010','CCS-01','CCS',60.0,'available',15.00,false),
('b1000001-0000-0000-0000-000000000033','a0000001-0000-0000-0000-000000000010','GB/T-01','GB/T',50.0,'maintenance',14.00,false),
('b1000001-0000-0000-0000-000000000034','a0000001-0000-0000-0000-000000000011','CCS-01','CCS',120.0,'available',18.00,false),
('b1000001-0000-0000-0000-000000000035','a0000001-0000-0000-0000-000000000011','CCS-02','CCS',120.0,'occupied',18.00,false),
('b1000001-0000-0000-0000-000000000036','a0000001-0000-0000-0000-000000000011','Type2-01','Type2',22.0,'available',8.50,true),
('b1000001-0000-0000-0000-000000000037','a0000001-0000-0000-0000-000000000012','CCS-01','CCS',150.0,'available',19.00,false),
('b1000001-0000-0000-0000-000000000038','a0000001-0000-0000-0000-000000000012','CCS-02','CCS',150.0,'available',19.00,false),
('b1000001-0000-0000-0000-000000000039','a0000001-0000-0000-0000-000000000012','CHAdeMO-01','CHAdeMO',50.0,'occupied',15.00,false)
ON CONFLICT (id) DO NOTHING;