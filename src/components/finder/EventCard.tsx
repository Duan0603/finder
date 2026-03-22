import type { Event } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Users,
  Heart,
  Share2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const spotsLeft = event.maxParticipants - event.participants;
  const isFull = spotsLeft <= 0;

  // Use the relevant image assigned in mock-data
  const imageUrl =
    event.image || `https://picsum.photos/seed/event-${event.id}/800/450`;

  return (
    <Link to={`/events/${event.id}`} className="block">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card rounded-[2rem] overflow-hidden border border-border/5 shadow-soft group"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/80 backdrop-blur-md text-foreground border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1">
              {event.category || "EVENT"}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all">
              <Heart className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground opacity-80">
              {event.date}
            </span>
            <h3 className="font-bold text-base truncate tracking-tight">
              {event.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-y-2 gap-x-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {event.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-secondary" />
              {event.participants}/{event.maxParticipants} ĐÃ ĐĂNG KÝ
            </div>
          </div>

          <Button
            disabled={isFull}
            className={`w-full rounded-2xl h-11 font-black text-xs uppercase tracking-widest transition-all ${isFull ? "bg-muted" : "gradient-hot text-white shadow-glow hover:scale-[1.02] active:scale-95"}`}
          >
            {isFull ? "Đã hết chỗ" : "Đăng ký tham gia"}
            {!isFull && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </motion.div>
    </Link>
  );
};
