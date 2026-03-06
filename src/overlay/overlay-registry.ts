import {
  Film,
  Clapperboard,
  Gamepad2,
  Palmtree,
  Store,
  Heart,
  Puzzle,
  BookOpen,
  Dumbbell,
  Church,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type OverlayAppId =
  | 'studio'
  | 'media'
  | 'gamification'
  | 'leisure'
  | 'market_overlay'
  | 'lifestyle'
  | 'hobbies'
  | 'knowledge'
  | 'sports'
  | 'religion'
  | 'services';

export interface OverlaySecondaryNavItem {
  id: string;
  label: string;
}

export interface OverlayPrimaryNavItem {
  id: string;
  label: string;
  secondaryNav: OverlaySecondaryNavItem[];
}

export interface OverlayAppDefinition {
  id: OverlayAppId;
  label: string;
  icon: LucideIcon;
  color: string;
  category: string;
  description: string;
  primaryNav: OverlayPrimaryNavItem[];
}

export const overlayAppList: OverlayAppDefinition[] = [
  {
    id: 'studio',
    label: 'Studio',
    icon: Film,
    color: 'from-rose-500 to-pink-600',
    category: 'Creative',
    description: 'Design, video, coding, and office creation suite',
    primaryNav: [
      {
        id: 'designer',
        label: 'Designer',
        secondaryNav: [
          { id: 'templates', label: 'Templates' },
          { id: 'create_new', label: 'Create New' },
          { id: 'my_designs', label: 'My Designs' },
          { id: 'brand_kit', label: 'Brand Kit' },
        ],
      },
      {
        id: 'video',
        label: 'Video',
        secondaryNav: [
          { id: 'video_editor', label: 'Video Editor' },
          { id: 'ai_enhancement', label: 'AI Enhancement' },
          { id: 'my_videos', label: 'My Videos' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'coder',
        label: 'Coder',
        secondaryNav: [
          { id: 'code_editor', label: 'Code Editor' },
          { id: 'ai_debugger', label: 'AI Debugger' },
          { id: 'projects', label: 'Projects' },
          { id: 'syntax_highlighting', label: 'Syntax Highlighting' },
        ],
      },
      {
        id: 'office',
        label: 'Office',
        secondaryNav: [
          { id: 'documents', label: 'Documents' },
          { id: 'spreadsheets', label: 'Spreadsheets' },
          { id: 'presentations', label: 'Presentations' },
          { id: 'file_management', label: 'File Management' },
        ],
      },
      {
        id: 'creative_marketplace',
        label: 'Creative Marketplace',
        secondaryNav: [
          { id: 'stock_photos', label: 'Stock Photos' },
          { id: 'audio_library', label: 'Audio Library' },
          { id: 'models_3d', label: '3D Models' },
          { id: 'fonts', label: 'Fonts' },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: Clapperboard,
    color: 'from-red-500 to-rose-600',
    category: 'Entertainment',
    description: 'Media viewing and content management hub',
    primaryNav: [
      {
        id: 'movies',
        label: 'Movies',
        secondaryNav: [
          { id: 'movie_library', label: 'Movie Library' },
          { id: 'categories', label: 'Categories' },
          { id: 'watch_list', label: 'Watch List' },
          { id: 'continue_watching', label: 'Continue Watching' },
        ],
      },
      {
        id: 'series',
        label: 'Series',
        secondaryNav: [
          { id: 'series_library', label: 'Series Library' },
          { id: 'episodes', label: 'Episodes' },
          { id: 'seasons', label: 'Seasons' },
          { id: 'my_series', label: 'My Series' },
        ],
      },
      {
        id: 'docs',
        label: 'Docs',
        secondaryNav: [
          { id: 'library', label: 'Library' },
          { id: 'educational', label: 'Educational' },
          { id: 'topics', label: 'Topics' },
          { id: 'featured', label: 'Featured' },
        ],
      },
      {
        id: 'live_tv',
        label: 'Live TV',
        secondaryNav: [],
      },
      {
        id: 'kids',
        label: 'Kids',
        secondaryNav: [
          { id: 'kids_content', label: 'Kids Content' },
          { id: 'educational', label: 'Educational' },
          { id: 'entertainment', label: 'Entertainment' },
          { id: 'parental_controls', label: 'Parental Controls' },
        ],
      },
    ],
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Gamepad2,
    color: 'from-emerald-500 to-green-600',
    category: 'Engagement',
    description: 'Quizzes, challenges, rewards, and analytics',
    primaryNav: [
      {
        id: 'quizzes_challenges',
        label: 'Quizzes & Challenges',
        secondaryNav: [
          { id: 'quiz_builder', label: 'Quiz Builder' },
          { id: 'challenge_creator', label: 'Challenge Creator' },
          { id: 'question_bank', label: 'Question Bank' },
          { id: 'templates', label: 'Templates' },
        ],
      },
      {
        id: 'rewards_leaderboards',
        label: 'Rewards & Leaderboards',
        secondaryNav: [
          { id: 'reward_system', label: 'Reward System' },
          { id: 'leaderboard_setup', label: 'Leaderboard Setup' },
          { id: 'badge_designer', label: 'Badge Designer' },
          { id: 'point_system', label: 'Point System' },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        secondaryNav: [
          { id: 'engagement_metrics', label: 'Engagement Metrics' },
          { id: 'performance_analytics', label: 'Performance Analytics' },
          { id: 'progress_tracking', label: 'Progress Tracking' },
          { id: 'reports', label: 'Reports' },
        ],
      },
    ],
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: Palmtree,
    color: 'from-amber-500 to-orange-600',
    category: 'Community',
    description: 'Community clubs and event bookings',
    primaryNav: [
      {
        id: 'clubs_community',
        label: 'Clubs & Community',
        secondaryNav: [
          { id: 'club_directory', label: 'Club Directory' },
          { id: 'club_management', label: 'Club Management' },
          { id: 'community_groups', label: 'Community Groups' },
          { id: 'membership', label: 'Membership' },
        ],
      },
      {
        id: 'events_calendar_booking',
        label: 'Events Calendar & Booking',
        secondaryNav: [
          { id: 'calendar_view', label: 'Calendar View' },
          { id: 'event_creation', label: 'Event Creation' },
          { id: 'booking_system', label: 'Booking System' },
          { id: 'ticketing', label: 'Ticketing' },
        ],
      },
    ],
  },
  {
    id: 'market_overlay',
    label: 'Market',
    icon: Store,
    color: 'from-violet-500 to-purple-600',
    category: 'Commerce',
    description: 'Marketplace, orders, sellers, and offers',
    primaryNav: [
      {
        id: 'marketplace',
        label: 'Marketplace',
        secondaryNav: [
          { id: 'product_listings', label: 'Product Listings' },
          { id: 'categories', label: 'Categories' },
          { id: 'search', label: 'Search' },
          { id: 'featured', label: 'Featured' },
        ],
      },
      {
        id: 'orders',
        label: 'Orders',
        secondaryNav: [
          { id: 'order_management', label: 'Order Management' },
          { id: 'order_history', label: 'Order History' },
          { id: 'tracking', label: 'Tracking' },
          { id: 'returns', label: 'Returns' },
        ],
      },
      {
        id: 'sellers',
        label: 'Sellers',
        secondaryNav: [
          { id: 'seller_profiles', label: 'Seller Profiles' },
          { id: 'seller_verification', label: 'Seller Verification' },
          { id: 'seller_analytics', label: 'Seller Analytics' },
          { id: 'reviews', label: 'Reviews' },
        ],
      },
      {
        id: 'offers',
        label: 'Offers',
        secondaryNav: [
          { id: 'discount_codes', label: 'Discount Codes' },
          { id: 'promotions', label: 'Promotions' },
          { id: 'special_offers', label: 'Special Offers' },
          { id: 'bulk_pricing', label: 'Bulk Pricing' },
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: Heart,
    color: 'from-pink-500 to-fuchsia-600',
    category: 'Lifestyle',
    description: 'Food, events, bookings, flights, and cars',
    primaryNav: [
      {
        id: 'food',
        label: 'Food',
        secondaryNav: [
          { id: 'restaurant_finder', label: 'Restaurant Finder' },
          { id: 'reservations', label: 'Reservations' },
          { id: 'delivery', label: 'Delivery' },
          { id: 'reviews', label: 'Reviews' },
        ],
      },
      {
        id: 'events',
        label: 'Events',
        secondaryNav: [
          { id: 'event_finder', label: 'Event Finder' },
          { id: 'ticket_booking', label: 'Ticket Booking' },
          { id: 'event_calendar', label: 'Event Calendar' },
          { id: 'my_events', label: 'My Events' },
        ],
      },
      {
        id: 'booking',
        label: 'Booking',
        secondaryNav: [
          { id: 'hotel_booking', label: 'Hotel Booking' },
          { id: 'property_rental', label: 'Property Rental' },
          { id: 'vacation_packages', label: 'Vacation Packages' },
          { id: 'travel_insurance', label: 'Travel Insurance' },
        ],
      },
      {
        id: 'flight',
        label: 'Flight',
        secondaryNav: [
          { id: 'flight_search', label: 'Flight Search' },
          { id: 'flight_booking', label: 'Flight Booking' },
          { id: 'check_in', label: 'Check-in' },
          { id: 'flight_status', label: 'Flight Status' },
        ],
      },
      {
        id: 'car',
        label: 'Car',
        secondaryNav: [
          { id: 'car_rental', label: 'Car Rental' },
          { id: 'car_sharing', label: 'Car Sharing' },
          { id: 'airport_transfers', label: 'Airport Transfers' },
          { id: 'long_term_rental', label: 'Long-term Rental' },
        ],
      },
    ],
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    icon: Puzzle,
    color: 'from-cyan-500 to-blue-600',
    category: 'Community',
    description: 'Crafts, photography, and cooking communities',
    primaryNav: [
      {
        id: 'crafts',
        label: 'Crafts',
        secondaryNav: [
          { id: 'craft_tutorials', label: 'Craft Tutorials' },
          { id: 'project_ideas', label: 'Project Ideas' },
          { id: 'materials', label: 'Materials' },
          { id: 'community', label: 'Community' },
        ],
      },
      {
        id: 'photography',
        label: 'Photography',
        secondaryNav: [
          { id: 'photo_gallery', label: 'Photo Gallery' },
          { id: 'photography_tips', label: 'Photography Tips' },
          { id: 'camera_reviews', label: 'Camera Reviews' },
          { id: 'photo_contests', label: 'Photo Contests' },
        ],
      },
      {
        id: 'cooking',
        label: 'Cooking',
        secondaryNav: [
          { id: 'recipe_library', label: 'Recipe Library' },
          { id: 'cooking_classes', label: 'Cooking Classes' },
          { id: 'ingredient_guide', label: 'Ingredient Guide' },
          { id: 'meal_planning', label: 'Meal Planning' },
          { id: 'community_competitions', label: 'Community Competitions' },
        ],
      },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    category: 'Learning',
    description: 'Books, courses, exams, certificates, and AI study',
    primaryNav: [
      {
        id: 'books',
        label: 'Books',
        secondaryNav: [
          { id: 'digital_library', label: 'Digital Library' },
          { id: 'ebooks', label: 'E-Books' },
          { id: 'reading_lists', label: 'Reading Lists' },
          { id: 'book_reviews', label: 'Book Reviews' },
        ],
      },
      {
        id: 'courses',
        label: 'Courses',
        secondaryNav: [
          { id: 'course_catalog', label: 'Course Catalog' },
          { id: 'my_courses', label: 'My Courses' },
          { id: 'course_builder', label: 'Course Builder' },
          { id: 'progress_tracking', label: 'Progress Tracking' },
        ],
      },
      {
        id: 'exams',
        label: 'Exams',
        secondaryNav: [
          { id: 'exam_builder', label: 'Exam Builder' },
          { id: 'test_scheduler', label: 'Test Scheduler' },
          { id: 'grading_system', label: 'Grading System' },
          { id: 'performance_reports', label: 'Performance Reports' },
        ],
      },
      {
        id: 'certificates',
        label: 'Certificates',
        secondaryNav: [
          { id: 'certificate_templates', label: 'Certificate Templates' },
          { id: 'certificate_issuance', label: 'Certificate Issuance' },
          { id: 'verification_system', label: 'Verification System' },
          { id: 'digital_badges', label: 'Digital Badges' },
        ],
      },
      {
        id: 'ai_study_assist',
        label: 'AI Study Assist',
        secondaryNav: [
          { id: 'text_summarizer', label: 'Text Summarizer' },
          { id: 'flashcard_generator', label: 'Flashcard Generator' },
          { id: 'personalized_learning', label: 'Personalized Learning' },
          { id: 'study_planner', label: 'Study Planner' },
        ],
      },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: Dumbbell,
    color: 'from-emerald-500 to-teal-600',
    category: 'Sports',
    description: 'Teams, matches, training, and fitness tracking',
    primaryNav: [
      {
        id: 'football',
        label: 'Football',
        secondaryNav: [
          { id: 'team_roster', label: 'Team Roster' },
          { id: 'match_schedule', label: 'Match Schedule' },
          { id: 'performance_stats', label: 'Performance Stats' },
          { id: 'training_plans', label: 'Training Plans' },
        ],
      },
      {
        id: 'basketball',
        label: 'Basketball',
        secondaryNav: [
          { id: 'team_roster', label: 'Team Roster' },
          { id: 'match_schedule', label: 'Match Schedule' },
          { id: 'performance_stats', label: 'Performance Stats' },
          { id: 'training_plans', label: 'Training Plans' },
        ],
      },
      {
        id: 'soccer',
        label: 'Soccer',
        secondaryNav: [
          { id: 'team_roster', label: 'Team Roster' },
          { id: 'match_schedule', label: 'Match Schedule' },
          { id: 'performance_stats', label: 'Performance Stats' },
          { id: 'training_plans', label: 'Training Plans' },
        ],
      },
      {
        id: 'fitness_tracking',
        label: 'Fitness Tracking',
        secondaryNav: [
          { id: 'personal_training', label: 'Personal Training' },
          { id: 'progress_monitoring', label: 'Progress Monitoring' },
          { id: 'health_metrics', label: 'Health Metrics' },
          { id: 'goal_setting', label: 'Goal Setting' },
        ],
      },
    ],
  },
  {
    id: 'religion',
    label: 'Religion',
    icon: Church,
    color: 'from-yellow-500 to-amber-600',
    category: 'Wellness',
    description: 'Religious texts, practice tools, and trackers',
    primaryNav: [
      {
        id: 'quran',
        label: 'Quran',
        secondaryNav: [
          { id: 'digital_quran', label: 'Digital Quran' },
          { id: 'search_functionality', label: 'Search Functionality' },
          { id: 'recitation_tools', label: 'Recitation Tools' },
          { id: 'translation', label: 'Translation' },
        ],
      },
      {
        id: 'hadith',
        label: 'Hadith',
        secondaryNav: [
          { id: 'hadith_collection', label: 'Hadith Collection' },
          { id: 'search_hadith', label: 'Search Hadith' },
          { id: 'categorization', label: 'Categorization' },
          { id: 'explanation', label: 'Explanation' },
        ],
      },
      {
        id: 'prayer',
        label: 'Prayer',
        secondaryNav: [
          { id: 'prayer_times', label: 'Prayer Times' },
          { id: 'qibla_direction', label: 'Qibla Direction' },
          { id: 'prayer_tracker', label: 'Prayer Tracker' },
          { id: 'mosque_finder', label: 'Mosque Finder' },
        ],
      },
      {
        id: 'fasting',
        label: 'Fasting',
        secondaryNav: [
          { id: 'ramadan_tracker', label: 'Ramadan Tracker' },
          { id: 'fasting_schedule', label: 'Fasting Schedule' },
          { id: 'duas_collection', label: 'Duas Collection' },
          { id: 'nutrition_tips', label: 'Nutrition Tips' },
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Wrench,
    color: 'from-slate-500 to-zinc-700',
    category: 'Utility',
    description: 'Home and personal service bookings',
    primaryNav: [
      {
        id: 'housekeeping',
        label: 'Housekeeping',
        secondaryNav: [
          { id: 'service_providers', label: 'Service Providers' },
          { id: 'booking_system', label: 'Booking System' },
          { id: 'provider_reviews', label: 'Provider Reviews' },
          { id: 'service_packages', label: 'Service Packages' },
        ],
      },
      {
        id: 'gardening',
        label: 'Gardening',
        secondaryNav: [
          { id: 'garden_services', label: 'Garden Services' },
          { id: 'lawn_care', label: 'Lawn Care' },
          { id: 'landscaping', label: 'Landscaping' },
          { id: 'plant_care', label: 'Plant Care' },
        ],
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        secondaryNav: [
          { id: 'home_repair', label: 'Home Repair' },
          { id: 'plumbing', label: 'Plumbing' },
          { id: 'electrical', label: 'Electrical' },
          { id: 'hvac', label: 'HVAC' },
        ],
      },
      {
        id: 'babysitting',
        label: 'Babysitting',
        secondaryNav: [
          { id: 'babysitters', label: 'Babysitters' },
          { id: 'booking_system', label: 'Booking System' },
          { id: 'background_checks', label: 'Background Checks' },
          { id: 'parent_reviews', label: 'Parent Reviews' },
        ],
      },
    ],
  },
];

export const overlayAppIds = overlayAppList.map((app) => app.id) as OverlayAppId[];

export const overlayAppsById: Record<OverlayAppId, OverlayAppDefinition> = overlayAppList.reduce(
  (acc, app) => {
    acc[app.id] = app;
    return acc;
  },
  {} as Record<OverlayAppId, OverlayAppDefinition>,
);

export const overlayDefaultEnabledApps: Record<OverlayAppId, boolean> = overlayAppList.reduce(
  (acc, app) => {
    acc[app.id] = true;
    return acc;
  },
  {} as Record<OverlayAppId, boolean>,
);

export function getOverlayDefaultPrimaryId(appId: OverlayAppId): string {
  return overlayAppsById[appId].primaryNav[0]?.id ?? '';
}

export function getOverlayPrimaryNav(appId: OverlayAppId, primaryId: string): OverlayPrimaryNavItem | undefined {
  return overlayAppsById[appId].primaryNav.find((primary) => primary.id === primaryId);
}

export function getOverlayDefaultSecondaryId(appId: OverlayAppId, primaryId: string): string {
  return getOverlayPrimaryNav(appId, primaryId)?.secondaryNav[0]?.id ?? '';
}
