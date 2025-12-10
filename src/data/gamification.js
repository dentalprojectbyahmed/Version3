// Gamification System with Peshawar Humor

export const badges = [
  {
    id: 'early-bird',
    name: 'Subah Sawere Wala',
    description: 'Came for 3 PM appointment on time (rare in Peshawar!)',
    icon: '🌅',
    points: 10,
    condition: 'arrive_on_time'
  },
  {
    id: 'pain-warrior',
    name: 'Dard Sahan Wala',
    description: 'Survived RCT without crying',
    icon: '💪',
    points: 50,
    condition: 'complete_rct'
  },
  {
    id: 'loyal-patient',
    name: 'Wafadar Mareez',
    description: 'Visited 10 times (not just for free checkup)',
    icon: '🏆',
    points: 100,
    condition: 'visit_count_10'
  },
  {
    id: 'payment-king',
    name: 'Udhar Nahi Wala',
    description: 'Paid full amount without asking for discount',
    icon: '👑',
    points: 75,
    condition: 'full_payment'
  },
  {
    id: 'referral-master',
    name: 'Sifarish Baaz',
    description: 'Brought 5 friends (actual patients, not just for chai)',
    icon: '🎯',
    points: 150,
    condition: 'referral_5'
  },
  {
    id: 'hygiene-hero',
    name: 'Saaf Suthra',
    description: 'Came with clean teeth (brushed before visit)',
    icon: '✨',
    points: 25,
    condition: 'good_hygiene'
  },
  {
    id: 'brave-kid',
    name: 'Bahadur Bacha',
    description: 'Child patient who didn\'t run away',
    icon: '🦸',
    points: 30,
    condition: 'brave_child'
  },
  {
    id: 'no-phobia',
    name: 'Dar Nahi Lagta',
    description: 'Overcame dental phobia',
    icon: '🎖️',
    points: 40,
    condition: 'overcome_phobia'
  },
  {
    id: 'follow-up',
    name: 'Wapsi Wala',
    description: 'Actually came back for follow-up',
    icon: '🔄',
    points: 35,
    condition: 'follow_up'
  },
  {
    id: 'emergency-calm',
    name: 'Emergency Mein Thanda',
    description: 'Stayed calm during emergency treatment',
    icon: '🧊',
    points: 45,
    condition: 'calm_emergency'
  }
];

export const peshawariMessages = {
  appointment_reminder: [
    'Yara kal 3 baje appointment hai, waqt pe ana!',
    'Bhai sahab, appointment yaad hai na? Late mat hona!',
    'Kal appointment hai, traffic ka bahana nahi chalega!',
    'Reminder: Kal treatment hai, bhagna nahi!',
    'Bhai appointment hai kal, Peshawar time pe nahi, actual time pe ana!'
  ],
  
  payment_due: [
    'Yara udhar khatam karo, bill clear karo!',
    'Bhai payment pending hai, kab doge?',
    'Udhar ki yaad dila rahe hain, jaldi karo!',
    'Payment baqi hai boss, clear kar do!',
    'Bhai sahab, bill ka kya scene hai?'
  ],
  
  treatment_complete: [
    'Mubarak ho! Treatment complete, ab smile karo!',
    'Shabash! Dard seh liya, ab khush raho!',
    'Kamaal kar diya! Treatment khatam, points mile!',
    'Bhai wah! Brave ho tum, badge mil gaya!',
    'Excellent! Ab apne dost ko bhi bhejo!'
  ],
  
  missed_appointment: [
    'Yara appointment miss kar diya? Kya scene hai?',
    'Bhai aana tha aaj, kahan reh gaye?',
    'Appointment miss! Traffic ya bhool gaye?',
    'Kya hua bhai? Appointment yaad nahi raha?',
    'Miss kar diya appointment, agli baar waqt pe ana!'
  ],
  
  low_points: [
    'Points kam hain yara, mehnat karo!',
    'Bhai points barhaao, warna kuch nahi milega!',
    'Kam points hain, zyada visits chahiye!',
    'Points increase karo, rewards lene hain!',
    'Bhai thora effort lagao, points kam hain!'
  ],
  
  high_points: [
    'Mashallah! Bohat points hain, keep it up!',
    'Kamaal! Top patient ho tum!',
    'Wah bhai wah! Points dekho!',
    'Excellent! Peshawar ka best patient!',
    'Zabardast! Aise hi chalta raho!'
  ],
  
  referral_thanks: [
    'Shukriya! Dost bheja, points mile!',
    'Jazakallah! Referral ka badge mil gaya!',
    'Bhai kamaal! Sifarish ki, reward lo!',
    'Thanks yara! Dost laye, points barhe!',
    'Mubarak! Referral bonus mil gaya!'
  ]
};

export const pointsSystem = {
  actions: {
    appointment_completed: 10,
    on_time_arrival: 5,
    full_payment: 15,
    referral: 25,
    follow_up_attended: 10,
    treatment_completed: 20,
    emergency_handled: 15,
    good_hygiene: 5,
    no_cancellation: 5,
    review_given: 10
  },
  
  penalties: {
    missed_appointment: -10,
    late_arrival: -5,
    payment_overdue: -15,
    cancelled_last_minute: -10
  },
  
  rewards: {
    100: { type: 'discount', value: 5, message: '5% discount on next visit!' },
    250: { type: 'discount', value: 10, message: '10% discount earned!' },
    500: { type: 'free_checkup', value: 1, message: 'Free checkup unlocked!' },
    750: { type: 'discount', value: 15, message: '15% discount - VIP status!' },
    1000: { type: 'free_cleaning', value: 1, message: 'Free cleaning session!' }
  }
};

export const getRandomMessage = (category) => {
  const messages = peshawariMessages[category] || [];
  return messages[Math.floor(Math.random() * messages.length)] || 'Reminder!';
};

export const calculatePoints = (patientData) => {
  // Calculate total points based on patient activities
  let points = 0;
  
  // Add points for completed actions
  if (patientData.completedAppointments) {
    points += patientData.completedAppointments * pointsSystem.actions.appointment_completed;
  }
  
  if (patientData.onTimeArrivals) {
    points += patientData.onTimeArrivals * pointsSystem.actions.on_time_arrival;
  }
  
  if (patientData.fullPayments) {
    points += patientData.fullPayments * pointsSystem.actions.full_payment;
  }
  
  if (patientData.referrals) {
    points += patientData.referrals * pointsSystem.actions.referral;
  }
  
  // Subtract penalties
  if (patientData.missedAppointments) {
    points += patientData.missedAppointments * pointsSystem.penalties.missed_appointment;
  }
  
  return Math.max(0, points); // Never go below 0
};

export const getAvailableRewards = (points) => {
  const available = [];
  
  for (const [threshold, reward] of Object.entries(pointsSystem.rewards)) {
    if (points >= parseInt(threshold)) {
      available.push({ threshold, ...reward });
    }
  }
  
  return available;
};

export const getNextReward = (points) => {
  const thresholds = Object.keys(pointsSystem.rewards).map(t => parseInt(t)).sort((a, b) => a - b);
  
  for (const threshold of thresholds) {
    if (points < threshold) {
      return {
        threshold,
        pointsNeeded: threshold - points,
        reward: pointsSystem.rewards[threshold]
      };
    }
  }
  
  return null; // Max level reached
};
