 const doctors = [
  {
    id: 1,   
    name: 'Dr. Arjun Patel',
    specialty: 'General Physician',
    hospital: 'City Clinic, Trichy',
    rating: 4.5,
    reviews: 150,
    experience: '9 yrs',
    available: 'Today',
    badge: 'Trusted',
    badgeColor: 'blue',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    slots: {
      'Mon Apr 07': ['8:00 AM', '9:00 AM', '10:00 AM', '2:00 PM', '5:00 PM'],
      'Tue Apr 08': ['9:30 AM', '11:30 AM', '3:30 PM'],
      'Wed Apr 09': ['10:00 AM', '1:00 PM'],
    },
    bookedSlots: {
      'Mon Apr 07': ['9:00 AM'],
    },
  },
 ];

 export default doctors