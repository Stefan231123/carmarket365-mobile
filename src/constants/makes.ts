// Top car makes available on the platform
// Sorted alphabetically for dropdown usage

export const CAR_MAKES = [
  'Abarth', 'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
  'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GMC', 'Great Wall',
  'Honda', 'Hummer', 'Hyundai',
  'Infiniti', 'Isuzu', 'Iveco',
  'Jaguar', 'Jeep',
  'Kia', 'Koenigsegg',
  'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus',
  'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot', 'Polestar', 'Pontiac', 'Porsche',
  'Renault', 'Rolls-Royce', 'Rover',
  'Saab', 'Seat', 'Škoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota',
  'Vauxhall', 'Volkswagen', 'Volvo',
  'Zastava',
] as const;

export type CarMake = typeof CAR_MAKES[number];
