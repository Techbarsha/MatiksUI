import React, { useEffect } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- ANIMATION & LAYOUT CONSTANTS ---
const FINAL_SCORE = 2840;
const SCORE_TIMING_DURATION = 1650;
const CONFETTI_DURATION = 1200;
const RANK_DELAY = 200;
const BUTTON_WIDTH = Math.min(width - 48, 320);
const BUTTON_HEIGHT = 58;
const BUTTON_RADIUS = 18;
const SHIMMER_WIDTH = BUTTON_WIDTH * 0.42;
const SHIMMER_START = -SHIMMER_WIDTH * 1.2;
const SHIMMER_END = BUTTON_WIDTH + SHIMMER_WIDTH * 1.2;
const CONFETTI_ORIGIN_X = width / 2;
const CONFETTI_ORIGIN_Y = Math.max(120, height * 0.27);
const AMBIENT_ROTATION = -18 * (Math.PI / 180);

// --- TYPE DEFINITIONS ---
type ConfettiParticleConfig = {
  color: string;
  gravity: number;
  height: number;
  rotationStart: number;
  rotationVelocity: number;
  size: number;
  vx: number;
  vy: number;
};

type ConfettiParticleProps = {
  config: ConfettiParticleConfig;
  opacityProgress: SharedValue<number>;
  progress: SharedValue<number>;
};

type AnimatedScalar = number;

// --- CONFETTI PARTICLE CONFIGURATION ---
const CONFETTI_COLORS = [
  '#FF5F6D',
  '#FFC400',
  '#4ECDC4',
  '#5F8EFF',
  '#BA68FF',
  '#FFFFFF',
];

// A seeded pseudo-random number generator to create a consistent set of particles.
const seeded = (index: number, offset: number) => {
  const value = Math.sin(index * 97.13 + offset * 31.7) * 43758.5453;
  return value - Math.floor(value);
};

/**
 * An array of pre-calculated confetti particle configurations.
 * This avoids recalculating these values on every render.
 */
const CONFETTI_PARTICLES: ConfettiParticleConfig[] = Array.from(
  { length: 28 },
  (_, index) => {
    const angle = (-155 + seeded(index, 1) * 130) * (Math.PI / 180);
    const speed = 180 + seeded(index, 2) * 210;

    return {
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      gravity: 220 + seeded(index, 5) * 140,
      height: 4 + seeded(index, 4) * 6,
      rotationStart: seeded(index, 6) * Math.PI,
      rotationVelocity: (seeded(index, 7) * 8 - 4) * Math.PI,
      size: 8 + seeded(index, 3) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  },
);

// --- ASSETS & LAYOUT ---
const SCOREBOARD_ART = require('./assets/scoreboard.png');
const IS_WIDE_LAYOUT = width >= 760;
const CONTENT_WIDTH = Math.min(width - 48, 420);

/**
 * A single confetti particle component.
 * Its animation is driven by shared values for performance.
 */
const ConfettiParticle = ({
  config,
  opacityProgress,
  progress,
}: ConfettiParticleProps) => {
  // --- DERIVED VALUES FOR PARTICLE ANIMATION ---
  // These values are calculated on the UI thread for smooth animation.

  const translateX = useDerivedValue(
    () => CONFETTI_ORIGIN_X + config.vx * progress.value,
    [config.vx, progress],
  );
  const translateY = useDerivedValue(
    () =>
      CONFETTI_ORIGIN_Y +
      config.vy * progress.value +
      config.gravity * progress.value * progress.value,
    [config.gravity, config.vy, progress],
  );
  const rotation = useDerivedValue(
    () => config.rotationStart + config.rotationVelocity * progress.value,
    [config.rotationStart, config.rotationVelocity, progress],
  );
  const scale = useDerivedValue(() => 1 - progress.value * 0.18, [progress]);
  const opacity = useDerivedValue(
    () => Math.max(0, (1 - progress.value) * opacityProgress.value),
    [opacityProgress, progress],
  );

  return (
    <Group
      origin={{ x: 0, y: 0 }}
      opacity={opacity as unknown as AnimatedScalar}
      transform={[
        { translateX: translateX as unknown as AnimatedScalar },
        { translateY: translateY as unknown as AnimatedScalar },
        { rotate: rotation as unknown as AnimatedScalar },
        { scale: scale as unknown as AnimatedScalar },
      ]}
    >
      <RoundedRect
        x={-config.size / 2}
        y={-config.height / 2}
        width={config.size}
        height={config.height}
        r={config.height / 2}
        color={config.color}
      />
    </Group>
  );
};

/**
 * A simple SVG logo component for the top of the screen.
 */
const MatiksLogo = () => {
  return (
    <View style={styles.logoWrap}>
      <Svg width={82} height={82} viewBox="0 0 82 82" fill="none">
        <SvgCircle
          cx={24}
          cy={41}
          r={18}
          stroke="#B7FF5A"
          strokeWidth={10}
        />
        <SvgCircle
          cx={58}
          cy={41}
          r={18}
          stroke="#B7FF5A"
          strokeWidth={10}
        />
        <Path
          d="M41 12L31 70"
          stroke="#B7FF5A"
          strokeWidth={10}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const ScoreRevealScreen = () => {
  // --- REANIMATED SHARED VALUES ---
  // These values drive all the animations on the screen.
  const scoreValue = useSharedValue(0);
  const comboScale = useSharedValue(0);
  const comboOpacity = useSharedValue(0);
  const flamePulse = useSharedValue(1);
  const flameOpacity = useSharedValue(1);
  const rankTranslateY = useSharedValue(50);
  const rankOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(1);
  const shimmerTranslateX = useSharedValue(SHIMMER_START);
  const confettiProgress = useSharedValue(1);
  const confettiOpacity = useSharedValue(0);
  const ambientPulse = useSharedValue(0);

  useEffect(() => {
    // --- MAIN ANIMATION SEQUENCE ---
    // Score overshoots slightly, then settles for a premium reveal.
    scoreValue.value = withSequence(
      withTiming(FINAL_SCORE * 1.035, {
        duration: SCORE_TIMING_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(
        FINAL_SCORE,
        {
          damping: 12,
          stiffness: 140,
          mass: 0.8,
          overshootClamping: false,
        },
        (finished) => {
          'worklet';

          if (!finished) {
            return;
          }

          confettiProgress.value = 0;
          confettiOpacity.value = 1;
          confettiProgress.value = withTiming(1, {
            duration: CONFETTI_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          confettiOpacity.value = withSequence(
            withTiming(1, {
              duration: 120,
              easing: Easing.linear,
            }),
            withTiming(0, {
              duration: CONFETTI_DURATION,
              easing: Easing.out(Easing.quad),
            }),
          );

          // --- COMBO BADGE ANIMATION ---
          // Pop in with a bounce effect.
          comboScale.value = withSequence(
            withTiming(1.15, {
              duration: 260,
              easing: Easing.out(Easing.back(1.4)),
            }),
            withSpring(1, {
              damping: 10,
              stiffness: 170,
              mass: 0.7,
            }),
          );

          comboOpacity.value = withTiming(1, {
            duration: 220,
            easing: Easing.out(Easing.quad),
          });

          // --- FLAME ICON PULSE ---
          // Loop the flame icon's scale and opacity for a pulsing effect.
          flamePulse.value = withRepeat(
            withSequence(
              withTiming(1.2, {
                duration: 700,
                easing: Easing.inOut(Easing.quad),
              }),
              withTiming(1, {
                duration: 700,
                easing: Easing.inOut(Easing.quad),
              }),
            ),
            -1,
            false,
          );

          flameOpacity.value = withRepeat(
            withSequence(
              withTiming(0.6, {
                duration: 700,
                easing: Easing.inOut(Easing.quad),
              }),
              withTiming(1, {
                duration: 700,
                easing: Easing.inOut(Easing.quad),
              }),
            ),
            -1,
            false,
          );

          // --- RANK REVEAL ANIMATION ---
          // Slide up and fade in after a short delay.
          rankTranslateY.value = withSequence(
            withTiming(50, {
              duration: RANK_DELAY,
              easing: Easing.linear,
            }),
            withTiming(0, {
              duration: 480,
              easing: Easing.out(Easing.cubic),
            }),
          );

          rankOpacity.value = withSequence(
            withTiming(0, {
              duration: RANK_DELAY,
              easing: Easing.linear,
            }),
            withTiming(1, {
              duration: 360,
              easing: Easing.out(Easing.quad),
            }),
          );
        },
      ),
    );

    // --- SHARE BUTTON SHIMMER ---
    // A looping shimmer effect that moves across the button.
    shimmerTranslateX.value = withRepeat(
      withSequence(
        withTiming(SHIMMER_END, {
          duration: 1900,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(SHIMMER_START, {
          duration: 0,
          easing: Easing.linear,
        }),
      ),
      -1,
      false,
    );

    // --- AMBIENT GLOW PULSE ---
    // A subtle, slow pulse for the background glow elements.
    ambientPulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [
    ambientPulse,
    comboOpacity,
    comboScale,
    confettiOpacity,
    confettiProgress,
    flameOpacity,
    flamePulse,
    rankOpacity,
    rankTranslateY,
    scoreValue,
    shimmerTranslateX,
  ]);

  // --- DERIVED VALUES & ANIMATED STYLES ---
  const animatedScoreText = useDerivedValue(() => {
    const clamped = interpolate(
      scoreValue.value,
      [0, FINAL_SCORE * 1.035],
      [0, FINAL_SCORE * 1.035],
      Extrapolation.CLAMP,
    );
    // Round the value to get an integer ticking effect.
    return `${Math.round(clamped)}`;
  });

  const scoreAnimatedProps = useAnimatedProps(
    () =>
      ({
        text: animatedScoreText.value,
      }) as never,
  );

  // The glow behind the score text scales with the score animation.
  const scoreGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scoreValue.value,
      [0, FINAL_SCORE],
      [0.94, 1.03],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
    };
  });

  const comboAnimatedStyle = useAnimatedStyle(() => ({
    opacity: comboOpacity.value,
    transform: [{ scale: comboScale.value }],
  }));

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ scale: flamePulse.value }],
  }));

  const rankAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rankOpacity.value,
    transform: [{ translateY: rankTranslateY.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  // Derived values for the background ambient glow animations.
  const glowOpacity = useDerivedValue(
    () => 0.24 + ambientPulse.value * 0.18,
    [ambientPulse],
  );
  const haloOpacity = useDerivedValue(
    () => 0.12 + ambientPulse.value * 0.08,
    [ambientPulse],
  );
  const bandOffset = useDerivedValue(
    () => -40 + ambientPulse.value * 28,
    [ambientPulse],
  );

  // --- EVENT HANDLERS ---
  const handleSharePress = () => {
    ctaScale.value = withSequence(
      withTiming(0.95, {
        duration: 90,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(1.05, {
        damping: 8,
        stiffness: 220,
        mass: 0.45,
      }),
      withSpring(1, {
        damping: 10,
        stiffness: 180,
        mass: 0.6,
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MatiksLogo />
        {/* --- BACKGROUND LAYER --- */}

        <View pointerEvents="none" style={styles.backgroundLayer}>
          <Canvas style={styles.backgroundCanvas}>
            <Rect x={0} y={0} width={width} height={height}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width, height)}
                colors={['#04070F', '#08101E', '#0B1630', '#07111F']}
                positions={[0, 0.34, 0.74, 1]}
              />
            </Rect>

            {/* Ambient glow fields */}
            <Circle
              cx={width * 0.84}
              cy={height * 0.18}
              r={150}
              color="rgba(58, 157, 255, 0.16)"
              opacity={glowOpacity as unknown as AnimatedScalar}
            >
              <BlurMask blur={56} style="solid" />
            </Circle>

            <Circle
              cx={width * 0.18}
              cy={height * 0.78}
              r={132}
              color="rgba(0, 223, 186, 0.12)"
              opacity={glowOpacity as unknown as AnimatedScalar}
            >
              <BlurMask blur={52} style="solid" />
            </Circle>

            <Circle
              cx={width * 0.5}
              cy={height * 0.42}
              r={178}
              color="rgba(255, 255, 255, 0.08)"
              opacity={haloOpacity as unknown as AnimatedScalar}
            >
              <BlurMask blur={72} style="solid" />
            </Circle>

            {/* Animated light bands */}
            <Group
              transform={[
                { translateX: bandOffset as unknown as AnimatedScalar },
                { rotate: AMBIENT_ROTATION },
              ]}
            >
              <Rect
                x={-width * 0.15}
                y={height * 0.16}
                width={width * 1.35}
                height={96}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(width * 1.35, 0)}
                  colors={[
                    'rgba(255,255,255,0)',
                    'rgba(111,191,255,0.03)',
                    'rgba(255,255,255,0.10)',
                    'rgba(111,191,255,0.03)',
                    'rgba(255,255,255,0)',
                  ]}
                  positions={[0, 0.18, 0.5, 0.82, 1]}
                />
              </Rect>
            </Group>

            <Group transform={[{ rotate: AMBIENT_ROTATION }]}>
              <Rect
                x={-width * 0.1}
                y={height * 0.72}
                width={width * 1.2}
                height={1.5}
                color="rgba(255,255,255,0.08)"
              />
              <Rect
                x={width * 0.16}
                y={height * 0.14}
                width={width * 0.54}
                height={1}
                color="rgba(135,206,255,0.1)"
              />
            </Group>
          </Canvas>
        </View>

        {/* --- CONFETTI LAYER --- */}
        <View pointerEvents="none" style={styles.confettiLayer}>
          <Canvas style={styles.confettiCanvas}>
            {CONFETTI_PARTICLES.map((particle, index) => (
              <ConfettiParticle
                key={`confetti-${index}`}
                config={particle}
                opacityProgress={confettiOpacity}
                progress={confettiProgress}
              />
            ))}
          </Canvas>
        </View>

        {/* --- UI CONTENT --- */}
        <View style={styles.heroRow}>
          <View style={styles.contentColumn}>
            <View style={styles.headerBlock}>
              <Text style={styles.kicker}>MATCH COMPLETE</Text>
              <Text style={styles.title}>POST GAME</Text>
              <Text style={styles.title}>SCORE</Text>
              <Text style={styles.titleAccent}>REVEAL</Text>
              <Text style={styles.subtitle}>
                Fast mental duels. Sharp finishes. Share the win.
              </Text>
            </View>

            {/* Animated Score */}
            <Animated.View style={[styles.scoreShell, scoreGlowStyle]}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <AnimatedTextInput
                editable={false}
                underlineColorAndroid="transparent"
                caretHidden
                value={undefined}
                defaultValue="0"
                animatedProps={scoreAnimatedProps}
                style={styles.scoreValue}
              />
              <View style={styles.scoreUnderline} />
            </Animated.View>

            {/* Animated Combo Badge */}
            <Animated.View style={[styles.comboBadge, comboAnimatedStyle]}>
              <Animated.Text style={[styles.comboEmoji, flameAnimatedStyle]}>
                {'\uD83D\uDD25'}
              </Animated.Text>
              <Text style={styles.comboText}>7 Combo Streak!</Text>
            </Animated.View>

            {/* Animated Rank Card */}
            <Animated.View style={[styles.rankCard, rankAnimatedStyle]}>
              <Text style={styles.rankLabel}>Leaderboard Finish</Text>
              <Text style={styles.rankValue}>#3 of 1,200</Text>
            </Animated.View>

            <View style={styles.ctaSpacer} />

            {/* Animated Share Button with Shimmer */}
            <AnimatedPressable
              onPress={handleSharePress}
              style={[styles.shareButton, ctaAnimatedStyle]}
            >
              <Canvas pointerEvents="none" style={styles.shimmerCanvas}>
                <Group
                  transform={[
                    { translateX: shimmerTranslateX as unknown as AnimatedScalar },
                    { rotate: 18 * (Math.PI / 180) },
                  ]}
                >
                  <Rect
                    x={0}
                    y={-BUTTON_HEIGHT}
                    width={SHIMMER_WIDTH}
                    height={BUTTON_HEIGHT * 3}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(SHIMMER_WIDTH, 0)}
                      colors={[
                        'rgba(255,255,255,0)',
                        'rgba(255,255,255,0.12)',
                        'rgba(255,255,255,0.42)',
                        'rgba(255,255,255,0.12)',
                        'rgba(255,255,255,0)',
                      ]}
                      positions={[0, 0.22, 0.5, 0.78, 1]}
                    />
                  </Rect>
                </Group>
              </Canvas>
              <Text style={styles.shareText}>Share Result</Text>
            </AnimatedPressable>
          </View>

          {/* Decorative Art */}
          <View style={styles.artColumn}>
            <View style={styles.artFrame}>
              <Image
                source={SCOREBOARD_ART}
                style={styles.scoreboardArt}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#070B14',
  },
  heroRow: {
    width: '100%',
    maxWidth: 1120,
    flexDirection: IS_WIDE_LAYOUT ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  contentColumn: {
    width: IS_WIDE_LAYOUT ? '56%' : '100%',
    maxWidth: CONTENT_WIDTH,
    alignItems: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
  },
  artColumn: {
    width: IS_WIDE_LAYOUT ? '44%' : '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: IS_WIDE_LAYOUT ? 0 : 18,
    marginLeft: IS_WIDE_LAYOUT ? 18 : 0,
  },
  artFrame: {
    width: IS_WIDE_LAYOUT ? 360 : Math.min(width * 0.72, 320),
    height: IS_WIDE_LAYOUT ? 360 : Math.min(width * 0.72, 320),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboardArt: {
    width: '100%',
    height: '100%',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  logoWrap: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 3,
    transform: [{ scale: 0.68 }],
  },
  backgroundCanvas: {
    flex: 1,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiCanvas: {
    flex: 1,
  },
  headerBlock: {
    alignItems: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
    marginBottom: 28,
  },
  kicker: {
    color: '#78A9FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginBottom: 10,
  },
  title: {
    color: '#F3F7FF',
    fontSize: IS_WIDE_LAYOUT ? 56 : 42,
    fontWeight: '900',
    lineHeight: IS_WIDE_LAYOUT ? 54 : 40,
    letterSpacing: -2.2,
    textTransform: 'uppercase',
  },
  titleAccent: {
    color: '#B7FF5A',
    fontSize: IS_WIDE_LAYOUT ? 56 : 42,
    fontWeight: '900',
    lineHeight: IS_WIDE_LAYOUT ? 54 : 40,
    letterSpacing: -2.2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#B8C4DD',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 320,
    letterSpacing: 0.1,
  },
  scoreShell: {
    width: '100%',
    alignItems: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
    marginBottom: 28,
  },
  scoreLabel: {
    color: '#8EA0C3',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  scoreValue: {
    width: '100%',
    maxWidth: 320,
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    textAlign: IS_WIDE_LAYOUT ? 'left' : 'center',
    letterSpacing: 1.4,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  scoreUnderline: {
    width: 144,
    height: 6,
    borderRadius: 999,
    marginTop: 16,
    backgroundColor: 'rgba(72, 120, 255, 0.28)',
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 90, 0.28)',
    backgroundColor: 'rgba(255, 122, 24, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 22,
  },
  comboEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  comboText: {
    color: '#FFD39C',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  rankCard: {
    width: '100%',
    maxWidth: 320,
    alignSelf: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(120, 169, 255, 0.18)',
    marginBottom: 18,
  },
  rankLabel: {
    color: '#8EA0C3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  rankValue: {
    color: '#F4F7FF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  ctaSpacer: {
    height: 28,
  },
  shareButton: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    alignSelf: IS_WIDE_LAYOUT ? 'flex-start' : 'center',
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B7BFF',
    shadowColor: '#4B7BFF',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  shareText: {
    color: '#F8FBFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  shimmerCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
});

export default ScoreRevealScreen;
