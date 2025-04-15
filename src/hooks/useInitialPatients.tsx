// hooks/useInitialPatients.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type PatientRow = {
  id: number;
  name: string;
  age: number;
  room: string;
  bloodPressure: string;
  heartRate: number;
  oxygenLevel: number;
  gender: 'Male' | 'Female';
};

const randomVitals = () => ({
  bloodPressure: `${Math.floor(Math.random() * 70 + 90)}/${Math.floor(
    Math.random() * 40 + 60
  )}`,
  heartRate: Math.floor(Math.random() * (130 - 60) + 60),
  oxygenLevel: Math.floor(Math.random() * (100 - 85) + 85),
});

const generatePatientData = (post: any, index: number): PatientRow => {
  const firstNames = [
    'John',
    'Sarah',
    'Michael',
    'Emma',
    'Robert',
    'Laura',
    'David',
    'Olivia',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Brown',
    'Wilson',
    'Garcia',
    'Miller',
    'Davis',
    'Martinez',
  ];

  const isMale = index % 2 === 0; // even = male, odd = female

  const name = `${firstNames[index % firstNames.length]} ${
    lastNames[index % lastNames.length]
  }`;
  const age = Math.floor(Math.random() * 50 + 25);
  const room = `${100 + index}A`;

  return {
    id: post.id,
    name,
    age,
    room,
    gender: isMale ? 'Male' : 'Female',
    ...randomVitals(),
  };
};

export const useInitialPatients = () => {
  return useQuery<PatientRow[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/posts'
      );
      return response.data.map(generatePatientData);
    },
    staleTime: 1000 * 60 * 5,
  });
};
