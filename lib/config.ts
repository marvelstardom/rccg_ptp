export const demoMode = () => process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE === 'true';
export const configured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const church = {
  name: 'RCCG Peculiar Treasures Parish', assembly: '', city: 'Ado-Ekiti',
  timezone: 'Africa/Lagos', schedule: '7:00–8:20 a.m.',
  // Set true only after the church confirms the schedule and full address.
  confirmed: false, address: '', youtubeUrl: '', email: '', phone: '',
};
export const photos = [
  {src:'/images/church/ptp-67.webp',alt:'Congregation gathering at October Thanksgiving'},
  {src:'/images/church/ptp-3.webp',alt:'A worshipper with hands lifted during Thanksgiving'},
  {src:'/images/church/ptp-12.webp',alt:'Members worshipping together at church'},
  {src:'/images/church/ptp-9.webp',alt:'A smiling member at October Thanksgiving'},
  {src:'/images/church/ptp-21.webp',alt:'A member holding a welcome sign'},
  {src:'/images/church/ptp-24.webp',alt:'A smiling member in purple at Thanksgiving'},
  {src:'/images/church/ptp-60.webp',alt:'A member celebrating at church'},
];
export const modules = ['Home','Members','Departments','Programmes','Finance','Calendar','Messages','Reports','Notifications','Settings','Inventory','Profile','Website Content','Content Studio','Social Accounts','Approvals','Automation'];
export const slug = (name:string) => name.toLowerCase().replaceAll(' ','-');
