import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useRole, Role } from '@/lib/roleContext';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleSelectRole = (role: Role) => {
    setRole(role);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 starfield">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full romantic-gradient mb-8 glow"
        >
          <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </motion.div>
        
        <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
          Nivi's Thursday
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Welcome to our little movie night corner
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <RoleButton
          role="dherru"
          label="Dherru"
          delay={0.6}
          onClick={() => handleSelectRole('dherru')}
        />
        <RoleButton
          role="nivi"
          label="Nivi"
          delay={0.7}
          onClick={() => handleSelectRole('nivi')}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-muted-foreground/60 text-sm mt-16"
      >
        Choose who you are tonight
      </motion.p>
    </div>
  );
}

function RoleButton({
  role,
  label,
  delay,
  onClick,
}: {
  role: 'dherru' | 'nivi';
  label: string;
  delay: number;
  onClick: () => void;
}) {
  const gradientClass = role === 'dherru' 
    ? 'from-blue-500/20 via-purple-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 border-blue-400/30 hover:border-blue-400/50' 
    : 'from-pink-500/20 via-rose-500/20 to-amber-500/20 hover:from-pink-500/30 hover:via-rose-500/30 hover:to-amber-500/30 border-pink-400/30 hover:border-pink-400/50';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-16 py-8 rounded-2xl
        bg-gradient-to-br ${gradientClass}
        border backdrop-blur-xl
        transition-all duration-300
        group cursor-pointer
      `}
    >
      <span className="font-display text-3xl text-foreground group-hover:text-primary transition-colors">
        {label}
      </span>
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: role === 'dherru' 
            ? '0 0 40px hsla(220, 70%, 50%, 0.2)' 
            : '0 0 40px hsla(340, 70%, 50%, 0.2)',
        }}
      />
    </motion.button>
  );
}
