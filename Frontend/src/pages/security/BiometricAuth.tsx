import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Face as FaceIcon,
  VoiceChat as VoiceChatIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useBiometric } from '../../hooks/useBiometric';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`biometric-tabpanel-${index}`}
      aria-labelledby={`biometric-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BiometricAuth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const {
    enrollmentStatus,
    loading,
    error,
    success,
    enrollBiometric,
    resetState,
  } = useBiometric();

  // Refs for file inputs
  const faceInputRef = useRef<HTMLInputElement>(null);
  const fingerprintInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    resetState();
  };

  const handleFileSelect = async (
    type: 'face' | 'fingerprint' | 'voice',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await enrollBiometric(type, file);
      } catch (err) {
        console.error(`Failed to enroll ${type}:`, err);
      }
    }
  };

  const triggerFileInput = (type: 'face' | 'fingerprint' | 'voice') => {
    const inputRef = {
      face: faceInputRef,
      fingerprint: fingerprintInputRef,
      voice: voiceInputRef,
    }[type];

    inputRef.current?.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Biometric Authentication
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab 
              icon={<FaceIcon />} 
              label="Facial Recognition" 
              iconPosition="start"
            />
            <Tab 
              icon={<FingerprintIcon />} 
              label="Fingerprint" 
              iconPosition="start"
            />
            <Tab 
              icon={<VoiceChatIcon />} 
              label="Voice Recognition" 
              iconPosition="start"
            />
          </Tabs>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={faceInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect('face', e)}
          />
          <input
            type="file"
            ref={fingerprintInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect('fingerprint', e)}
          />
          <input
            type="file"
            ref={voiceInputRef}
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect('voice', e)}
          />

          <TabPanel value={activeTab} index={0}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Facial Recognition Enrollment
                </Typography>
                <Typography variant="body1" paragraph>
                  Position your face in front of the camera and follow the on-screen instructions.
                  Ensure good lighting and a clear background.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={enrollmentStatus.face ? <CheckIcon /> : <FaceIcon />}
                  onClick={() => triggerFileInput('face')}
                  disabled={loading || enrollmentStatus.face}
                >
                  {enrollmentStatus.face ? 'Enrolled' : 'Start Enrollment'}
                </Button>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  height: 300,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Camera Preview
                  </Typography>
                )}
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Fingerprint Enrollment
                </Typography>
                <Typography variant="body1" paragraph>
                  Place your finger on the fingerprint sensor and hold until scanning is complete.
                  You'll need to scan your fingerprint multiple times.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={enrollmentStatus.fingerprint ? <CheckIcon /> : <FingerprintIcon />}
                  onClick={() => triggerFileInput('fingerprint')}
                  disabled={loading || enrollmentStatus.fingerprint}
                >
                  {enrollmentStatus.fingerprint ? 'Enrolled' : 'Start Enrollment'}
                </Button>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  height: 300,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <FingerprintIcon sx={{ fontSize: 100, color: 'grey.400' }} />
                )}
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Voice Recognition Enrollment
                </Typography>
                <Typography variant="body1" paragraph>
                  Speak clearly into your microphone. You'll be asked to repeat several phrases
                  to create your voice profile.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={enrollmentStatus.voice ? <CheckIcon /> : <VoiceChatIcon />}
                  onClick={() => triggerFileInput('voice')}
                  disabled={loading || enrollmentStatus.voice}
                >
                  {enrollmentStatus.voice ? 'Enrolled' : 'Start Enrollment'}
                </Button>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  height: 300,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <VoiceChatIcon sx={{ fontSize: 100, color: 'grey.400' }} />
                )}
              </Box>
            </Stack>
          </TabPanel>

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Biometric data successfully enrolled!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export { BiometricAuth };