import { 
    View, 
    TextInput, 
    Text, 
    Alert, 
    KeyboardAvoidingView, 
    SafeAreaView, 
    StatusBar, 
    Platform, 
    ScrollView, 
    TouchableOpacity 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { navigateNested } from '../navigator/RootNavigator';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import styles from '../styles/LoginScreenStyles';

function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLoginPress = (data) => {
    console.log('Login data', data);
    Alert.alert('Login Successful', 'You have logged in successfully');
    navigateNested("Main", "Weather");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Feather name="activity" size={50} color="3498db" />
              </View>
            </View>
            
            <Text style={styles.header}>Build New Positive Habits</Text>
            <Text style={styles.subHeader}>Welcome back! Sign in to continue your journey.</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={20} color="#95a5a6" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="email"
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email'
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#95a5a6"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                  <Feather name="lock" size={20} color="#95a5a6" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="password"
                    rules={{ required: 'Password is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#95a5a6"
                        secureTextEntry={!passwordVisible}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={20} color="#95a5a6" />
                  </TouchableOpacity>
                </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                </View>

                {/* Dummy Password Button */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSubmit(onLoginPress)}
                >
                  <Text style={styles.loginButtonText}>LOG IN</Text>
                </TouchableOpacity>

                {/* Dummy Signup Button */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account?</Text>
                  <TouchableOpacity>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
            </ScrollView>
          </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

export default LoginScreen;