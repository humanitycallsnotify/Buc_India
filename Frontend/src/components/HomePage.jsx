import { lazy, Suspense } from "react";

const Hero = lazy(() => import("./Hero.jsx"));
const Marquee = lazy(() => import("./Marquee.jsx"));
const About = lazy(() => import("./About.jsx"));
const StatsStrip = lazy(() => import("./StatsStrip.jsx"));
const InfluencerSpotlight = lazy(() => import("./InfluencerSpotlight.jsx"));
const Safety = lazy(() => import("./Safety.jsx"));
const EventPromotionBanner = lazy(() => import("./EventPromotionBanner.jsx"));
const InfluencerVideos = lazy(() => import("./InfluencerVideos.jsx"));
const SafetyInfluencers = lazy(() => import("./SafetyInfluencers.jsx"));
const PartnerMarquee = lazy(() => import("./PartnerMarquee.jsx"));
const JoinOurFamily = lazy(() => import("./JoinOurFamily.jsx"));
const SectionFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-carbon">
    <div className="w-10 h-10 border-4 border-copper/20 border-t-copper rounded-full animate-spin" />
  </div>
);

const HomePage = () => (
  <Suspense fallback={<SectionFallback />}>
    <Hero />
    <EventPromotionBanner />
    <Marquee />
    <About />
    <InfluencerVideos />
    <SafetyInfluencers />
    <StatsStrip />
    <InfluencerSpotlight />
    <Safety />
    <PartnerMarquee />
    <JoinOurFamily />
  </Suspense>
);

export default HomePage;
