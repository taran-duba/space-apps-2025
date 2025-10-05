'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MedicalReviewCard from '@/components/medical-review';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const services: ServiceCardProps[] = [
  {
    title: 'Location Services',
    description: 'Explore location-based environmental data',
    icon: '📍',
    path: '/location-services'
  },
  {
    title: 'Diseases',
    description: 'Explore diseases and their symptoms',
    icon: '💡',
    path: '/diseases'
  }
];

const ServiceCard = ({ title, description, icon, path }: ServiceCardProps) => {
  const router = useRouter();
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => router.push(path)}
          className="w-full"
          variant="outline"
        >
          Open {title}
        </Button>
      </CardContent>
    </Card>
  );
};
export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let newGreeting = 'Hello';
      
      if (hour < 12) newGreeting = 'Good morning';
      else if (hour < 18) newGreeting = 'Good afternoon';
      else newGreeting = 'Good evening';
      
      setGreeting(newGreeting);
      
      // Format current time
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(timeString);
    };

    // Update time immediately and set interval
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">{greeting}!</h1>
        <p className="text-primary-foreground">{currentTime} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="mb-8">
        <MedicalReviewCard />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </div>
  );
}
