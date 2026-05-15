import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Mode = 'select' | 'login' | 'signup';

const LoginPage = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [club, setClub] = useState('');
  const [age, setAge] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [role, setRole] = useState<'coach' | 'player'>('player');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setPhone('');
    setClub('');
    setAge('');
    setAgeCategory('');
    setRole('player');
    setError('');
    setSuccess('');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('יש למלא אימייל וסיסמה');
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.error) setError(result.error);
    setIsLoading(false);
  };

  const handleSignup = async () => {
    if (!email.trim() || !password || !displayName.trim() || !phone.trim()) {
      setError('יש למלא את כל השדות כולל מספר טלפון');
      return;
    }
    if (password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (role === 'player') {
      const ageNum = parseInt(age);
      if (!age || isNaN(ageNum) || ageNum < 8 || ageNum > 50) {
        setError('יש למלא גיל (8-50)');
        return;
      }
      if (!club.trim()) {
        setError('יש למלא שם מועדון');
        return;
      }
      if (!ageCategory) {
        setError('יש לבחור קבוצת גיל');
        return;
      }
    }
    setIsLoading(true);
    setError('');
    const result = await signup(
      email.trim(),
      password,
      displayName.trim(),
      role,
      undefined,
      undefined,
      phone.trim() || undefined,
      club.trim() || undefined,
      age ? parseInt(age) : undefined,
      ageCategory || undefined
    );
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('ההרשמה הצליחה! חשבונך ממתין לאישור על ידי המאמן הראשי.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent">
            <span className="text-3xl font-black text-accent-foreground">I²</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">I² Analytics & Video</h1>
          <p className="mt-2 text-muted-foreground">ניתוח וידאו מקצועי לשחקני כדורסל</p>
        </div>

        <div className="gradient-card rounded-xl p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold text-foreground">ברוכים הבאים</h2>
              <Button
                onClick={() => { setMode('login'); resetFields(); }}
                className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-12 text-lg"
              >
                התחברות
              </Button>
              <Button
                onClick={() => { setMode('signup'); resetFields(); }}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground h-12 text-lg"
              >
                הרשמה
              </Button>
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold text-foreground">התחברות</h2>
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>סיסמה</Label>
                <Input
                  type="password"
                  placeholder="סיסמה"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleLogin} disabled={isLoading} className="w-full gradient-accent text-accent-foreground h-12 text-lg font-semibold">
                {isLoading ? 'מתחבר...' : 'כניסה'}
              </Button>
              <Button variant="ghost" onClick={() => { setMode('select'); resetFields(); }} className="w-full text-muted-foreground">
                חזרה
              </Button>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold text-foreground">הרשמה</h2>
              <div className="space-y-2">
                <Label>שם מלא</Label>
                <Input
                  placeholder="השם שלך"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>מספר טלפון</Label>
                <Input
                  type="tel"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  dir="ltr"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>סיסמה</Label>
                <Input
                  type="password"
                  placeholder="לפחות 6 תווים"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="h-12 bg-secondary border-border text-foreground"
                  maxLength={72}
                />
              </div>
              <div className="space-y-2">
                <Label>תפקיד</Label>
                <Select value={role} onValueChange={v => { setRole(v as 'coach' | 'player'); setError(''); }}>
                  <SelectTrigger className="h-12 bg-secondary border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="player">שחקן</SelectItem>
                    <SelectItem value="coach">מאמן</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team and age - for players */}
              {role === 'player' && (
                <>
                  <div className="space-y-2">
                    <Label>מועדון</Label>
                    <Input
                      placeholder="שם המועדון"
                      value={club}
                      onChange={e => { setClub(e.target.value); setError(''); }}
                      className="h-12 bg-secondary border-border text-foreground"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>גיל</Label>
                      <Input
                        type="number"
                        placeholder="הגיל שלך"
                        value={age}
                        onChange={e => { setAge(e.target.value); setError(''); }}
                        className="h-12 bg-secondary border-border text-foreground"
                        min={8}
                        max={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>קבוצת גיל</Label>
                      <Select value={ageCategory} onValueChange={v => { setAgeCategory(v); setError(''); }}>
                        <SelectTrigger className="h-12 bg-secondary border-border text-foreground">
                          <SelectValue placeholder="בחר קבוצה" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="U14">U14</SelectItem>
                          <SelectItem value="U15">U15</SelectItem>
                          <SelectItem value="U16">U16</SelectItem>
                          <SelectItem value="U18">U18</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-success">{success}</p>}
              <Button onClick={handleSignup} disabled={isLoading} className="w-full gradient-accent text-accent-foreground h-12 text-lg font-semibold">
                {isLoading ? 'נרשם...' : 'הרשמה'}
              </Button>
              <Button variant="ghost" onClick={() => { setMode('select'); resetFields(); }} className="w-full text-muted-foreground">
                חזרה
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
