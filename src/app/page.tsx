'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from '@/components/ui/spinner';
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';

interface Team {
  id: string;
  uid: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logo: string;
}

interface Competitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: 'home' | 'away';
  winner: boolean;
  team: Team;
  score: string;
  linescores: {
    value: number;
    displayValue: string;
    period: number;
  }[];
  records: {
    name: string;
    abbreviation?: string;
    type: string;
    summary: string;
  }[];
}

interface Venue {
  id: string;
  fullName: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  indoor: boolean;
}

interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
}

interface Competition {
  id: string;
  uid: string;
  date: string;
  attendance: number;
  venue: Venue;
  competitors: Competitor[];
  status: Status;
  broadcasts: {
    market: string;
    names: string[];
  }[];
  leaders: {
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    leaders: {
      displayValue: string;
      value: number;
      athlete: {
        id: string;
        fullName: string;
        displayName: string;
        shortName: string;
        headshot: string;
        jersey: string;
        position: {
          abbreviation: string;
        };
        team: {
          id: string;
        };
        active: boolean;
      };
      team: {
        id: string;
      };
    }[];
  }[];
  headlines: {
    type: string;
    description: string;
    shortLinkText: string;
  }[];
}

interface Game {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  week: {
    number: number;
  };
  competitions: Competition[];
  status: Status;
}

interface GamesResponse {
  leagues: {
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    slug: string;
    season: {
      year: number;
      startDate: string;
      endDate: string;
      displayName: string;
      type: {
        id: string;
        type: number;
        name: string;
        abbreviation: string;
      };
    };
  }[];
  events: Game[];
}

// Mock data generator for European football matches
function generateMockFootballMatches(date: string): Game[] {
  const teams = [
    // La Liga teams
    { id: '1', uid: '1', name: 'Real Sociedad', abbreviation: 'RSO', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Sociedad-logo.png', location: 'San Sebastián', displayName: 'Real Sociedad', shortDisplayName: 'Real Sociedad', color: '#1B407A', alternateColor: '#FFFFFF', isActive: true },
    { id: '2', uid: '2', name: 'Valladolid', abbreviation: 'VLL', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Valladolid-logo.png', location: 'Valladolid', displayName: 'Real Valladolid', shortDisplayName: 'Valladolid', color: '#E74600', alternateColor: '#FFFFFF', isActive: true },
    { id: '3', uid: '3', name: 'Espanyol', abbreviation: 'ESP', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Espanyol-logo.png', location: 'Barcelona', displayName: 'RCD Espanyol', shortDisplayName: 'Espanyol', color: '#1E57BF', alternateColor: '#FFB600', isActive: true },
    { id: '4', uid: '4', name: 'Atletico Madrid', abbreviation: 'ATM', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png', location: 'Madrid', displayName: 'Atlético Madrid', shortDisplayName: 'Atlético', color: '#CE3524', alternateColor: '#FFFFFF', isActive: true },
    { id: '5', uid: '5', name: 'Alavés', abbreviation: 'ALA', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Deportivo-Alaves-Logo.png', location: 'Vitoria', displayName: 'Deportivo Alavés', shortDisplayName: 'Alavés', color: '#12287C', alternateColor: '#FFFFFF', isActive: true },
    { id: '6', uid: '6', name: 'Rayo Vallecano', abbreviation: 'RAY', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Rayo-Vallecano-logo.png', location: 'Madrid', displayName: 'Rayo Vallecano', shortDisplayName: 'Rayo', color: '#FF0000', alternateColor: '#FFFFFF', isActive: true },
    { id: '7', uid: '7', name: 'Real Madrid', abbreviation: 'RMA', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png', location: 'Madrid', displayName: 'Real Madrid', shortDisplayName: 'Real Madrid', color: '#FFFFFF', alternateColor: '#000000', isActive: true },
    { id: '8', uid: '8', name: 'Leganés', abbreviation: 'LEG', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Club-Deportivo-Leganes-logo.png', location: 'Leganés', displayName: 'CD Leganés', shortDisplayName: 'Leganés', color: '#1D5A8B', alternateColor: '#FFFFFF', isActive: true },
    // Bundesliga teams
    { id: '9', uid: '9', name: 'Bayern Munich', abbreviation: 'BAY', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png', location: 'Munich', displayName: 'FC Bayern Munich', shortDisplayName: 'Bayern', color: '#DC052D', alternateColor: '#FFFFFF', isActive: true },
    { id: '10', uid: '10', name: 'St Pauli', abbreviation: 'STP', logo: 'https://logos-world.net/wp-content/uploads/2020/06/St-Pauli-logo.png', location: 'Hamburg', displayName: 'FC St. Pauli', shortDisplayName: 'St. Pauli', color: '#8B0000', alternateColor: '#FFFFFF', isActive: true },
    { id: '11', uid: '11', name: 'Gladbach', abbreviation: 'BMG', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Borussia-Monchengladbach-logo.png', location: 'Mönchengladbach', displayName: 'Borussia Mönchengladbach', shortDisplayName: 'Gladbach', color: '#000000', alternateColor: '#FFFFFF', isActive: true },
    { id: '12', uid: '12', name: 'RB Leipzig', abbreviation: 'RBL', logo: 'https://logos-world.net/wp-content/uploads/2020/06/RB-Leipzig-logo.png', location: 'Leipzig', displayName: 'RB Leipzig', shortDisplayName: 'Leipzig', color: '#EA0029', alternateColor: '#FFFFFF', isActive: true },
    { id: '13', uid: '13', name: 'Hoffenheim', abbreviation: 'TSG', logo: 'https://logos-world.net/wp-content/uploads/2020/06/TSG-1899-Hoffenheim-logo.png', location: 'Sinsheim', displayName: 'TSG 1899 Hoffenheim', shortDisplayName: 'Hoffenheim', color: '#1E3D6F', alternateColor: '#FFFFFF', isActive: true },
    { id: '14', uid: '14', name: 'Augsburg', abbreviation: 'FCA', logo: 'https://logos-world.net/wp-content/uploads/2020/06/FC-Augsburg-logo.png', location: 'Augsburg', displayName: 'FC Augsburg', shortDisplayName: 'Augsburg', color: '#BC0C1D', alternateColor: '#FFFFFF', isActive: true },
    { id: '15', uid: '15', name: 'Holstein Kiel', abbreviation: 'KSV', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Holstein-Kiel-logo.png', location: 'Kiel', displayName: 'Holstein Kiel', shortDisplayName: 'Holstein Kiel', color: '#0069AA', alternateColor: '#FFFFFF', isActive: true },
    { id: '16', uid: '16', name: 'Werder Bremen', abbreviation: 'SVW', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Werder-Bremen-logo.png', location: 'Bremen', displayName: 'SV Werder Bremen', shortDisplayName: 'Bremen', color: '#1D9053', alternateColor: '#FFFFFF', isActive: true },
    { id: '17', uid: '17', name: 'Wolfsburg', abbreviation: 'WOB', logo: 'https://logos-world.net/wp-content/uploads/2020/06/VfL-Wolfsburg-logo.png', location: 'Wolfsburg', displayName: 'VfL Wolfsburg', shortDisplayName: 'Wolfsburg', color: '#65B32E', alternateColor: '#FFFFFF', isActive: true },
    { id: '18', uid: '18', name: 'Heidenheim', abbreviation: 'FCH', logo: 'https://logos-world.net/wp-content/uploads/2020/06/FC-Heidenheim-logo.png', location: 'Heidenheim', displayName: '1. FC Heidenheim', shortDisplayName: 'Heidenheim', color: '#D3141C', alternateColor: '#FFFFFF', isActive: true },
    { id: '19', uid: '19', name: 'Frankfurt', abbreviation: 'SGE', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Eintracht-Frankfurt-logo.png', location: 'Frankfurt', displayName: 'Eintracht Frankfurt', shortDisplayName: 'Frankfurt', color: '#E1000F', alternateColor: '#FFFFFF', isActive: true },
    { id: '20', uid: '20', name: 'Stuttgart', abbreviation: 'VFB', logo: 'https://logos-world.net/wp-content/uploads/2020/06/VfB-Stuttgart-logo.png', location: 'Stuttgart', displayName: 'VfB Stuttgart', shortDisplayName: 'Stuttgart', color: '#FFFFFF', alternateColor: '#C41E3A', isActive: true }
  ];

  const venues = [
    // La Liga venues - matching team indices 0-7
    { id: '1', fullName: 'Reale Arena', city: 'San Sebastián', state: 'Gipuzkoa', country: 'Spain' }, // Real Sociedad
    { id: '2', fullName: 'José Zorrilla', city: 'Valladolid', state: 'Castilla y León', country: 'Spain' }, // Valladolid
    { id: '3', fullName: 'RCDE Stadium', city: 'Barcelona', state: 'Catalonia', country: 'Spain' }, // Espanyol
    { id: '4', fullName: 'Wanda Metropolitano', city: 'Madrid', state: 'Madrid', country: 'Spain' }, // Atlético Madrid
    { id: '5', fullName: 'Mendizorrotza', city: 'Vitoria', state: 'Álava', country: 'Spain' }, // Alavés
    { id: '6', fullName: 'Vallecas', city: 'Madrid', state: 'Madrid', country: 'Spain' }, // Rayo Vallecano
    { id: '7', fullName: 'Santiago Bernabéu', city: 'Madrid', state: 'Madrid', country: 'Spain' }, // Real Madrid
    { id: '8', fullName: 'Municipal de Butarque', city: 'Leganés', state: 'Madrid', country: 'Spain' }, // Leganés
    // Bundesliga venues - matching team indices 8-19
    { id: '9', fullName: 'Allianz Arena', city: 'Munich', state: 'Bavaria', country: 'Germany' }, // Bayern Munich
    { id: '10', fullName: 'Millerntor-Stadion', city: 'Hamburg', state: 'Hamburg', country: 'Germany' }, // St. Pauli
    { id: '11', fullName: 'Borussia-Park', city: 'Mönchengladbach', state: 'North Rhine-Westphalia', country: 'Germany' }, // Gladbach
    { id: '12', fullName: 'Red Bull Arena', city: 'Leipzig', state: 'Saxony', country: 'Germany' }, // RB Leipzig
    { id: '13', fullName: 'PreZero Arena', city: 'Sinsheim', state: 'Baden-Württemberg', country: 'Germany' }, // Hoffenheim
    { id: '14', fullName: 'WWK Arena', city: 'Augsburg', state: 'Bavaria', country: 'Germany' }, // Augsburg
    { id: '15', fullName: 'Holstein-Stadion', city: 'Kiel', state: 'Schleswig-Holstein', country: 'Germany' }, // Holstein Kiel
    { id: '16', fullName: 'Weserstadion', city: 'Bremen', state: 'Bremen', country: 'Germany' }, // Werder Bremen
    { id: '17', fullName: 'Volkswagen Arena', city: 'Wolfsburg', state: 'Lower Saxony', country: 'Germany' }, // Wolfsburg
    { id: '18', fullName: 'Voith-Arena', city: 'Heidenheim', state: 'Baden-Württemberg', country: 'Germany' }, // Heidenheim
    { id: '19', fullName: 'Deutsche Bank Park', city: 'Frankfurt', state: 'Hesse', country: 'Germany' }, // Frankfurt
    { id: '20', fullName: 'MHPArena', city: 'Stuttgart', state: 'Baden-Württemberg', country: 'Germany' } // Stuttgart
  ];

  // Real match data based on historical events
  const matchConfigs = [
    { 
      away: teams[1], // Valladolid
      home: teams[0], // Real Sociedad
      awayScore: '1', 
      homeScore: '2', 
      venue: venues[0], // Reale Arena
      status: 'STATUS_FINAL',
      description: 'La Liga'
    },
    { away: teams[3], home: teams[2], awayScore: '1', homeScore: '1', venue: venues[2], status: 'STATUS_FINAL', description: 'La Liga' },  // Espanyol 1-1 Atlético Madrid at Espanyol's venue
    { away: teams[5], home: teams[4], awayScore: '2', homeScore: '0', venue: venues[4], status: 'STATUS_FINAL', description: 'La Liga' },  // Rayo 2-0 Alavés at Alavés venue
    { away: teams[7], home: teams[6], awayScore: '2', homeScore: '3', venue: venues[6], status: 'STATUS_FINAL', description: 'La Liga' },  // Real Madrid 3-2 Leganés at Real Madrid venue
    { away: teams[9], home: teams[8], awayScore: '2', homeScore: '3', venue: venues[8], status: 'STATUS_FINAL', description: 'Bundesliga' },  // Bayern 3-2 St. Pauli at Bayern venue
    { away: teams[11], home: teams[10], awayScore: '0', homeScore: '1', venue: venues[10], status: 'STATUS_FINAL', description: 'Bundesliga' },  // Gladbach 1-0 RB Leipzig at Gladbach venue
    { away: teams[13], home: teams[12], awayScore: '1', homeScore: '1', venue: venues[12], status: 'STATUS_FINAL', description: 'Bundesliga' },  // Hoffenheim 1-1 Augsburg at Hoffenheim venue
    { away: teams[15], home: teams[14], awayScore: '3', homeScore: '0', venue: venues[14], status: 'STATUS_FINAL', description: 'Bundesliga' },  // Bremen 3-0 Holstein Kiel at Bremen venue
    { away: teams[17], home: teams[16], awayScore: '1', homeScore: '0', venue: venues[16], status: 'STATUS_FINAL', description: 'Bundesliga' },  // Heidenheim 1-0 Wolfsburg at Wolfsburg venue
    { away: teams[19], home: teams[18], awayScore: '0', homeScore: '1', venue: venues[18], status: 'STATUS_FINAL', description: 'Bundesliga' }   // Frankfurt 1-0 Stuttgart at Frankfurt venue
  ];

  return matchConfigs.map((match, index) => {
    const gameId = `game-${index + 1}`;
    const awayWinner = parseInt(match.awayScore) > parseInt(match.homeScore);
    const homeWinner = parseInt(match.homeScore) > parseInt(match.awayScore);
    
    return {
      id: gameId,
      uid: gameId,
      date: `${date}T20:00:00Z`,
      name: `${match.away.displayName} at ${match.home.displayName}`,
      shortName: `${match.away.abbreviation} @ ${match.home.abbreviation}`,
      season: { year: 2021, type: 2, slug: '2020-21' },
      week: { number: Math.floor(index / 3) + 1 },
      competitions: [{
        id: `comp-${index}`,
        uid: `comp-${index}`,
        date: `${date}T20:00:00Z`,
        attendance: Math.floor(Math.random() * 50000) + 30000,
        venue: {
          id: match.venue.id,
          fullName: match.venue.fullName,
          address: {
            city: match.venue.city,
            state: match.venue.state,
            country: match.venue.country
          },
          indoor: false
        },
        competitors: [
          {
            id: `away-${index}`,
            uid: `away-${index}`,
            type: 'team',
            order: 0,
            homeAway: 'away',
            winner: awayWinner,
            team: match.away,
            score: match.awayScore,
            linescores: [
              { value: Math.floor(parseInt(match.awayScore) / 2), displayValue: String(Math.floor(parseInt(match.awayScore) / 2)), period: 1 },
              { value: parseInt(match.awayScore) - Math.floor(parseInt(match.awayScore) / 2), displayValue: String(parseInt(match.awayScore) - Math.floor(parseInt(match.awayScore) / 2)), period: 2 }
            ],
            records: [{ name: 'Overall', type: 'total', summary: `${10 + Math.floor(Math.random() * 20)}-${5 + Math.floor(Math.random() * 10)}-${2 + Math.floor(Math.random() * 5)}` }]
          },
          {
            id: `home-${index}`,
            uid: `home-${index}`,
            type: 'team',
            order: 1,
            homeAway: 'home',
            winner: homeWinner,
            team: match.home,
            score: match.homeScore,
            linescores: [
              { value: Math.floor(parseInt(match.homeScore) / 2), displayValue: String(Math.floor(parseInt(match.homeScore) / 2)), period: 1 },
              { value: parseInt(match.homeScore) - Math.floor(parseInt(match.homeScore) / 2), displayValue: String(parseInt(match.homeScore) - Math.floor(parseInt(match.homeScore) / 2)), period: 2 }
            ],
            records: [{ name: 'Overall', type: 'total', summary: `${10 + Math.floor(Math.random() * 20)}-${5 + Math.floor(Math.random() * 10)}-${2 + Math.floor(Math.random() * 5)}` }]
          }
        ],
        status: match.status === 'STATUS_FINAL' ? {
          clock: 0,
          displayClock: '0:00',
          period: 2,
          type: {
            id: '3',
            name: 'STATUS_FINAL',
            state: 'post',
            completed: true,
            description: 'Final',
            detail: '2 Halves',
            shortDetail: 'FT'
          }
        } : {
          clock: 0,
          displayClock: '0:00',
          period: 2,
          type: {
            id: '3',
            name: 'STATUS_FINAL',
            state: 'post',
            completed: true,
            description: 'Final',
            detail: '2 Halves',
            shortDetail: 'FT'
          }
        },
        broadcasts: [{ market: 'international', names: ['BT Sport', 'Sky Sports'] }],
        leaders: [],
        headlines: match.description ? [
          {
            type: 'recap',
            description: match.description,
            shortLinkText: match.description?.split(' - ')[0] || 'Match Recap'
          }
        ] : []
      }],
      status: match.status === 'STATUS_FINAL' ? {
        clock: 0,
        displayClock: '0:00',
        period: 2,
        type: {
          id: '3',
          name: 'STATUS_FINAL',
          state: 'post',
          completed: true,
          description: 'Final',
          detail: '2 Halves',
          shortDetail: 'FT'
        }
      } : {
        clock: 0,
        displayClock: '0:00',
        period: 2,
        type: {
          id: '3',
          name: 'STATUS_FINAL',
          state: 'post',
          completed: true,
          description: 'Final',
          detail: '2 Halves',
          shortDetail: 'FT'
        }
      }
    } as Game;
  });
}

export default  function Home() {
  const [gamesData, setGamesData] = useState<GamesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2021-03-29'));
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // const {data : {user}} = await supabase.auth.getUser();
  // if (!user) redirect("/auth/sign-in"); 
  const fetchGamesByDate = (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      // Generate mock data for European football
      const mockGamesData: GamesResponse = {
        leagues: [{
          id: 'uefa',
          uid: 'uefa-champions',
          name: 'UEFA Champions League',
          abbreviation: 'UCL',
          slug: 'uefa-champions-league',
          season: {
            year: 2021,
            startDate: '2020-10-20',
            endDate: '2021-05-29',
            displayName: '2020/21 Season',
            type: {
              id: '2',
              type: 2,
              name: 'Season',
              abbreviation: 'season'
            }
          }
        }],
        events: generateMockFootballMatches(dateString)
      };
      
      setGamesData(mockGamesData);
    } catch (err) {
      setError('Failed to load games data.');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Clear previous data when date changes
      setGamesData(null);
      setError(null);
    }
  };

  const handleFetchGames = () => {
    fetchGamesByDate(selectedDate);
  };

  // Auto-load games on component mount
  useEffect(() => {
    fetchGamesByDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch when selected date changes
  useEffect(() => {
    fetchGamesByDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const getStatusColor = (status: Status) => {
    const statusType = status.type.name;
    
    switch (statusType) {
      case 'STATUS_IN_PROGRESS':
        return 'text-green-500';
      case 'STATUS_TIMEOUT':
        return 'text-yellow-500';
      case 'STATUS_HALFTIME':
        return 'text-blue-500';
      case 'STATUS_FINAL':
        return 'text-gray-500';
      case 'STATUS_SCHEDULED':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: Status) => {
    if (status.type.completed) {
      return status.type.shortDetail || status.type.description;
    }
    
    if (status.displayClock && status.displayClock !== '0:00') {
      return `${status.displayClock} - Q${status.period}`;
    }
    
    return status.type.shortDetail || status.type.description;
  };

  const handleRefresh = () => {
    fetchGamesByDate(selectedDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-6xl font-bold text-white">
              ⚽ European Football
            </CardTitle>
            <p className="text-xl text-gray-300">Champions League & Premier League Scores</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/auth/sign-in">
                <Button variant="secondary">Sign in</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign up</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-2 border-slate-600 text-white" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleFetchGames}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" variant="default" className="border-white" aria-label="Loading games" />
                    <span>Loading Games...</span>
                  </div>
                ) : (
                  'Get Games'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !gamesData && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" variant="primary" aria-label="Loading games data" />
            <p className="text-xl text-gray-300 mt-4">Loading games...</p>
          </div>
        )}

        {/* Games Display */}
        {gamesData && gamesData.events && gamesData.events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Games for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {gamesData.events.map((game) => {
                const competition = game.competitions[0];
                const homeTeam = competition.competitors.find(c => c.homeAway === 'home')?.team;
                const awayTeam = competition.competitors.find(c => c.homeAway === 'away')?.team;
                const homeScore = competition.competitors.find(c => c.homeAway === 'home')?.score;
                const awayScore = competition.competitors.find(c => c.homeAway === 'away')?.score;
                
                return (
                  <Card
                    key={game.id}
                    className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleGameClick(game)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-300">
                          Wk {game.week.number}
                        </span>
                        <span className={`text-xs font-medium ${getStatusColor(competition.status)}`}>
                          {getStatusText(competition.status)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={awayTeam?.logo}
                              alt={awayTeam?.displayName}
                              className="w-6 h-6"
                            />
                            <span className="text-white font-medium text-sm">
                              {awayTeam?.abbreviation}
                            </span>
                          </div>
                          <span className="text-white text-lg font-bold">
                            {awayScore}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={homeTeam?.logo}
                              alt={homeTeam?.displayName}
                              className="w-6 h-6"
                            />
                            <span className="text-white font-medium text-sm">
                              {homeTeam?.abbreviation}
                            </span>
                          </div>
                          <span className="text-white text-lg font-bold">
                            {homeScore}
                          </span>
                        </div>
                      </div>

                      <Separator className="my-2 opacity-20" />
                      <p className="text-xs text-gray-300 text-center truncate">
                        {competition.venue.address.city}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Games Message */}
        {gamesData && gamesData.events && gamesData.events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300">
              No games found for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Game Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open: boolean) => { if (!open) closeModal() }}>
          <DialogContent className="bg-slate-800 border border-white/10">
            <DialogHeader className="mb-2">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-white">Game Details</DialogTitle>
                <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh">
                  ↻
                </Button>
              </div>
            </DialogHeader>
            {isModalOpen && selectedGame && (() => {
                  const competition = selectedGame.competitions[0];
                  const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
                  const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
                  
                  return (
                    <div className="space-y-3">
                      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm text-white flex items-center gap-1"><span>ℹ️</span> Match Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <Card className="bg-black/20 border-white/10">
                              <CardContent className="p-2 flex items-start gap-2">
                                <span className="text-sm">📅</span>
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Date & Time</p>
                                  <p className="text-white font-medium text-xs">
                                    {new Date(competition.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                              <CardContent className="p-2 flex items-start gap-2">
                                <span className="text-sm">🏟️</span>
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Venue</p>
                                  <p className="text-white font-medium text-xs">{competition.venue.fullName}</p>
                                  <p className="text-gray-400 text-[10px] mt-0.5">
                                    {competition.venue.address.city}, {competition.venue.address.country}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                              <CardContent className="p-2 flex items-start gap-2">
                                <span className="text-sm">👥</span>
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Attendance</p>
                                  <p className="text-white font-medium text-xs">{competition.attendance?.toLocaleString()}</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                              <CardContent className="p-2 flex items-start gap-2">
                                <span className="text-sm">📺</span>
                                <div>
                                  <p className="text-gray-400 text-[10px] mb-0.5">Broadcast</p>
                                  <p className="text-white font-medium text-xs">
                                    {competition.broadcasts.map(b => b.names.slice(0, 2).join(', ')).join(', ')}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm text-white flex items-center gap-1"><span>⚽</span> Teams & Scores</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <div className={`flex items-center justify-between p-2 rounded transition-all ${
                            awayTeam?.winner ? 'bg-green-900/40 border-2 border-green-500/50' : 'bg-white/5 border border-white/10'
                          }`}>
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <img
                                src={awayTeam?.team.logo}
                                alt={awayTeam?.team.displayName}
                                className="w-8 h-8 object-contain flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-xs truncate">{awayTeam?.team.displayName}</p>
                                {awayTeam?.records.find(r => r.type === 'total') && (
                                  <p className="text-gray-400 text-[10px] truncate">
                                    {awayTeam?.records.find(r => r.type === 'total')?.summary}
                                  </p>
                                )}
                              </div>
                              {awayTeam?.winner && (
                                <Badge variant="success" className="flex-shrink-0">WIN</Badge>
                              )}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <p className="text-2xl font-extrabold text-white">{awayTeam?.score}</p>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between p-2 rounded transition-all ${
                            homeTeam?.winner ? 'bg-green-900/40 border-2 border-green-500/50' : 'bg-white/5 border border-white/10'
                          }`}>
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <img
                                src={homeTeam?.team.logo}
                                alt={homeTeam?.team.displayName}
                                className="w-8 h-8 object-contain flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-xs truncate">{homeTeam?.team.displayName}</p>
                                {homeTeam?.records.find(r => r.type === 'total') && (
                                  <p className="text-gray-400 text-[10px] truncate">
                                    {homeTeam?.records.find(r => r.type === 'total')?.summary}
                                  </p>
                                )}
                              </div>
                              {homeTeam?.winner && (
                                <Badge variant="success" className="flex-shrink-0">WIN</Badge>
                              )}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <p className="text-2xl font-extrabold text-white">{homeTeam?.score}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Game Leaders */}
                      {competition.leaders && competition.leaders.length > 0 && (
                        <Card className="bg-white/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Game Leaders</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {competition.leaders.map((leader, index) => (
                                <Card key={index} className="bg-white/5">
                                  <CardHeader className="py-3">
                                    <CardTitle className="text-white text-sm font-medium">{leader.displayName}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    {leader.leaders.map((player, playerIndex) => (
                                      <div key={playerIndex} className="flex items-center space-x-2">
                                        <img
                                          src={player.athlete.headshot}
                                          alt={player.athlete.displayName}
                                          className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                          <p className="text-white text-sm font-medium">
                                            {player.athlete.displayName}
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            {player.displayValue}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Headlines */}
                      {competition.headlines && competition.headlines.length > 0 && (
                        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm text-white flex items-center gap-1"><span>📝</span> Game Recap</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {competition.headlines.map((headline, index) => (
                              <div key={index} className="mb-4 last:mb-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <h5 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    {headline.shortLinkText}
                                  </h5>
                                </div>
                                <Card className="bg-black/30 border-white/10">
                                  <CardContent className="p-4">
                                    <p className="text-gray-200 leading-relaxed">{headline.description}</p>
                                  </CardContent>
                                </Card>
                              </div>
                            ))}
                            {competition.headlines.some(h => h.shortLinkText?.includes('Champions League Final')) && (
                              <div className="mt-2">
                                <Separator className="mb-2 opacity-20" />
                                <h5 className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1">
                                  <span>🎯</span> Key Highlights
                                </h5>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <Card className="bg-black/30 border-white/10">
                                    <CardContent className="p-1.5">
                                      <p className="text-gray-400 text-[10px] mb-0.5">⚽ Goal Scorer</p>
                                      <p className="text-white font-medium text-xs">Kai Havertz (42')</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-black/30 border-white/10">
                                    <CardContent className="p-1.5">
                                      <p className="text-gray-400 text-[10px] mb-0.5">🏆 Tournament</p>
                                      <p className="text-white font-medium text-xs">UEFA UCL</p>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                      {/* gamesData */}
                      {gamesData && (() => {
                        
                        return (
                          <div className="mt-4">
                            <Button variant="ghost" size="sm" onClick={() => setShowRaw((prev) => !prev)} className="text-xs px-3 py-1 mb-2">
                              {showRaw ? 'Hide Raw Data' : 'Show Raw Data'}
                            </Button>
                                {showRaw && (
                                  <pre className="overflow-x-auto bg-black/70 text-green-300 p-2 rounded text-xs max-h-96">
                                    {JSON.stringify(gamesData, null, 2)}
                                  </pre>
                                )}
                              </div>
                            );
                          })()}
                        
                      
                    </div>
                  );
                })()}
          </DialogContent>
        </Dialog>
        
      </div>
    </div>
  );
}