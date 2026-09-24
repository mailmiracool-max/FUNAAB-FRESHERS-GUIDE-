import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Navigation, 
  Compass, 
  MapPin, 
  X, 
  CornerDownRight, 
  CornerDownLeft, 
  ArrowUp, 
  CheckCircle2, 
  LocateFixed,
  Volume2,
  VolumeX,
  Footprints,
  Bell,
  BellRing,
  Smartphone,
  Zap,
  RotateCw,
  ListOrdered,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalculatedRoute, CampusLocation, UserLocationState, RouteStep } from '../types/campus';
import { 
  formatDistance, 
  formatDuration, 
  getBearingDegrees, 
  getDistanceMeters,
  triggerTurnHaptic,
  playTurnChime,
  requestTurnNotificationPermission,
  sendTurnNotification
} from '../utils/navigationEngine';

interface LiveNavigationHUDProps {
  route: CalculatedRoute;
  userLocation: UserLocationState;
  onExit: () => void;
  onRecenter: () => void;
  onApproachingTurnChange?: (isApproaching: boolean, turnCoord: { lat: number; lng: number } | null) => void;
}

export const LiveNavigationHUD: React.FC<LiveNavigationHUDProps> = ({
  route,
  userLocation,
  onExit,
  onRecenter,
  onApproachingTurnChange,
}) => {
  const [arrived, setArrived] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showStepsList, setShowStepsList] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';
  });

  // Turn alert trigger state
  const [isApproachingTurn, setIsApproachingTurn] = useState(false);
  const [turnDistance, setTurnDistance] = useState<number | null>(null);
  const [isTestPulsing, setIsTestPulsing] = useState(false);
  const notifiedStepsRef = useRef<Set<number>>(new Set());

  // Compute live distance from current user position to destination
  const currentCoords = userLocation.coords || route.originCoords;
  const remainingDistance = getDistanceMeters(currentCoords, route.destinationCoords);
  const bearingToDest = getBearingDegrees(currentCoords, route.destinationCoords);

  // Calculate arrow rotation taking device orientation heading into account if available
  const deviceHeading = userLocation.heading || 0;
  const arrowAngle = (bearingToDest - deviceHeading + 360) % 360;

  // Determine current active step along the route
  const progressRatio = Math.max(0, Math.min(1, 1 - remainingDistance / Math.max(route.distanceMeters, 1)));
  const calculatedIndex = Math.min(
    Math.floor(progressRatio * route.steps.length),
    route.steps.length - 1
  );

  // Look for the next upcoming maneuver/turn step
  let activeStepIndex = calculatedIndex;
  let distToNextTurn: number | null = null;
  let nextTurnStep: RouteStep | null = null;

  for (let i = calculatedIndex; i < route.steps.length; i++) {
    const step = route.steps[i];
    if (step.coord) {
      const dist = getDistanceMeters(currentCoords, step.coord);
      if (dist > 6) {
        distToNextTurn = dist;
        nextTurnStep = step;
        activeStepIndex = i;
        break;
      }
    }
  }

  const currentStep = nextTurnStep || route.steps[calculatedIndex] || route.steps[0];
  const stepTargetCoord = currentStep.coord || route.destinationCoords;

  // Web Speech API Voice synthesis instruction announcement
  const speakInstruction = useCallback((text: string) => {
    if (voiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [voiceMuted]);

  // Execute turn alert (Haptic + Audio + Speech + Notification)
  const fireTurnAlert = useCallback((step: RouteStep, distMeters: number) => {
    if (hapticEnabled) {
      triggerTurnHaptic();
    }

    if (!voiceMuted) {
      playTurnChime();
      speakInstruction(`In ${distMeters} meters, ${step.instruction}`);
    }

    if (notificationPermission === 'granted') {
      sendTurnNotification(step.instruction, distMeters);
    }
  }, [hapticEnabled, voiceMuted, notificationPermission, speakInstruction]);

  // Turn proximity monitoring
  useEffect(() => {
    if (arrived) {
      setIsApproachingTurn(false);
      onApproachingTurnChange?.(false, null);
      return;
    }

    const dist = distToNextTurn !== null 
      ? distToNextTurn 
      : (currentStep.coord ? getDistanceMeters(currentCoords, currentStep.coord) : remainingDistance);

    setTurnDistance(dist);

    const isClose = dist <= 35 && dist >= 5 && currentStep.maneuver !== 'arrive';

    setIsApproachingTurn(isClose || isTestPulsing);
    onApproachingTurnChange?.(isClose || isTestPulsing, isClose ? stepTargetCoord : null);

    if (isClose && !notifiedStepsRef.current.has(activeStepIndex)) {
      notifiedStepsRef.current.add(activeStepIndex);
      fireTurnAlert(currentStep, Math.round(dist));
    }
  }, [
    currentCoords,
    distToNextTurn,
    currentStep,
    activeStepIndex,
    stepTargetCoord,
    arrived,
    isTestPulsing,
    fireTurnAlert,
    onApproachingTurnChange,
    remainingDistance,
  ]);

  // Arrival detection
  useEffect(() => {
    if (remainingDistance < 22 && !arrived) {
      setArrived(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#fbbf24', '#10b981', '#ffffff'],
      });
      speakInstruction(`You have successfully arrived at ${route.destinationName}. Welcome!`);
    }
  }, [remainingDistance, arrived, route.destinationName, speakInstruction]);

  const handleTriggerTestPulse = () => {
    setIsTestPulsing(true);
    triggerTurnHaptic();
    playTurnChime();
    speakInstruction(`Test maneuver: ${currentStep.instruction}. Distance is 30 meters.`);
    setTimeout(() => setIsTestPulsing(false), 3000);
  };

  const handleToggleNotifications = async () => {
    if (notificationPermission !== 'granted') {
      const res = await requestTurnNotificationPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        sendTurnNotification('FUNAAB Turn Notifications Activated!', 0);
      }
    } else {
      alert('Turn notifications are already active for this browser session.');
    }
  };

  const renderManeuverIcon = () => {
    switch (currentStep.maneuver) {
      case 'turn-right':
        return <CornerDownRight className="w-5 h-5 text-amber-400" />;
      case 'turn-left':
        return <CornerDownLeft className="w-5 h-5 text-amber-400" />;
      case 'arrive':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <ArrowUp className="w-5 h-5 text-amber-400" />;
    }
  };

  const isAlertActive = isApproachingTurn || isTestPulsing;

  return (
    <>
      {/* Steps List Drawer */}
      {showStepsList && (
        <div className="absolute top-20 left-4 right-4 sm:left-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-3xl shadow-2xl p-4 flex flex-col max-h-[60vh] animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                <ListOrdered className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Turn-by-Turn Directions ({route.steps.length} Steps)
              </h4>
            </div>
            <button
              onClick={() => setShowStepsList(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/80 pt-2 space-y-1">
            {route.steps.map((step, idx) => {
              const isCurrentStep = idx === activeStepIndex;
              return (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl flex items-start gap-2.5 transition ${
                    isCurrentStep 
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200' 
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-snug">
                      {step.instruction}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{Math.round(step.distanceMeters)}m
                    </span>
                  </div>
                  {isCurrentStep && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main HUD Banner at Top */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 z-30 max-w-2xl mx-auto pointer-events-auto">
        <div 
          className={`rounded-2xl shadow-2xl backdrop-blur-md p-3 sm:p-4 border transition-all flex flex-col gap-2.5 ${
            arrived
              ? 'bg-emerald-950/95 border-emerald-500 text-white'
              : isAlertActive
              ? 'bg-slate-950/95 border-amber-400 ring-4 ring-amber-400/20 text-white animate-pulse'
              : 'bg-slate-950/90 border-emerald-500/40 text-white'
          }`}
        >
          {/* Approaching Turn Alert Banner */}
          {isAlertActive && !arrived && (
            <div className="bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-black flex items-center justify-between shadow-md">
              <div className="flex items-center gap-1.5 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                <span className="uppercase tracking-wide">
                  ⚠️ TURN AHEAD: {turnDistance ? `${Math.round(turnDistance)}m` : 'Approaching'}
                </span>
              </div>
              <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full uppercase font-mono">
                Live Guidance
              </span>
            </div>
          )}

          {/* Top bar: Destination & Control Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  FUNAAB Smart Navigation
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  To: {route.destinationName}
                </h3>
              </div>
            </div>

            {/* Navigation HUD Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Steps List Toggle */}
              <button
                onClick={() => setShowStepsList(!showStepsList)}
                title="View Full Turn-by-Turn Steps"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition flex items-center gap-1 text-xs"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Steps</span>
              </button>

              {/* Speak instruction out loud */}
              <button
                onClick={() => speakInstruction(currentStep.instruction)}
                title="Repeat Voice Instruction"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Haptic Vibration Toggle */}
              <button
                onClick={() => {
                  const next = !hapticEnabled;
                  setHapticEnabled(next);
                  if (next) triggerTurnHaptic();
                }}
                title={hapticEnabled ? 'Haptic Vibration Enabled' : 'Haptic Vibration Disabled'}
                className={`p-1.5 rounded-lg transition ${
                  hapticEnabled
                    ? 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>

              {/* Audio Chime Mute Toggle */}
              <button
                onClick={() => setVoiceMuted(!voiceMuted)}
                title={voiceMuted ? 'Voice & Speech Unmuted' : 'Mute Voice & Speech'}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Recenter Map */}
              <button
                onClick={onRecenter}
                title="Recenter on My Location"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
              >
                <LocateFixed className="w-3.5 h-3.5" />
              </button>

              {/* Exit Navigation */}
              <button
                onClick={onExit}
                title="Exit Navigation"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Guidance Display: Rotating Bearing Compass & Maneuver Instruction */}
          <div 
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              isAlertActive
                ? 'bg-amber-950/50 border-amber-400 shadow-xl'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {/* Rotating Bearing Compass Arrow */}
            <div 
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isAlertActive
                  ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse'
                  : 'bg-emerald-600/30 border border-emerald-500/50'
              }`}
            >
              <div
                className="transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${arrowAngle}deg)` }}
              >
                <Navigation className={`w-6 h-6 ${isAlertActive ? 'text-amber-300 fill-amber-300' : 'text-amber-400 fill-amber-400'}`} />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono text-emerald-300 bg-slate-900 px-1 rounded border border-slate-700">
                {Math.round(bearingToDest)}°
              </span>
            </div>

            {/* Current Instruction Text & Maneuver Icon */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  {renderManeuverIcon()}
                  <span>{isAlertActive ? 'Upcoming Turn' : `Step ${activeStepIndex + 1} of ${route.steps.length}`}</span>
                </span>
                {turnDistance !== null && (
                  <span className="text-slate-400 text-[11px] font-mono">
                    • in {formatDistance(Math.round(turnDistance))}
                  </span>
                )}
              </div>
              <p className={`text-xs sm:text-sm font-black leading-snug transition-colors mt-0.5 ${isAlertActive ? 'text-amber-200' : 'text-white'}`}>
                {arrived ? `🎉 You have arrived at ${route.destinationName}!` : currentStep.instruction}
              </p>
            </div>

            {/* Total Distance Countdown */}
            <div className="text-right flex-shrink-0">
              <span className={`text-lg sm:text-xl font-black font-mono block ${isAlertActive ? 'text-amber-300' : 'text-amber-400'}`}>
                {formatDistance(remainingDistance)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {formatDuration(Math.round(remainingDistance / 1.25))} walk
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isAlertActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.round(progressRatio * 100))}%` }}
            ></div>
          </div>

          {/* High Precision Telemetry Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {userLocation.isSnapped
                    ? 'Snapped to Campus Route'
                    : userLocation.isSimulated
                    ? 'Precise Campus Sim'
                    : `GPS Fixed (±${userLocation.accuracy ?? 3}m)`}
                </span>
              </span>
              {userLocation.speed !== undefined && userLocation.speed !== null && userLocation.speed > 0 && (
                <span className="text-slate-300">
                  • {userLocation.speed} km/h
                </span>
              )}
            </div>
            <div className="text-slate-400">
              Compass Bearing: {Math.round(userLocation.heading ?? bearingToDest)}°
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
