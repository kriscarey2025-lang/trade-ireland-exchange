import confetti from 'canvas-confetti';

// Subtle, celebratory confetti burst
export function fireConfetti() {
  // First burst - center
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'],
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['circle', 'square'],
    scalar: 0.9,
  });

  // Second burst - slightly delayed, from sides
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6'],
      ticks: 150,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 25,
      scalar: 0.8,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#F59E0B', '#EC4899', '#10B981'],
      ticks: 150,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 25,
      scalar: 0.8,
    });
  }, 150);
}

// More subtle confetti for secondary achievements
export function fireSubtleConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#10B981', '#3B82F6', '#8B5CF6'],
    ticks: 150,
    gravity: 1.3,
    decay: 0.95,
    startVelocity: 20,
    shapes: ['circle'],
    scalar: 0.7,
  });
}
