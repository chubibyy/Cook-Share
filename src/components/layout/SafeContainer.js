// src/components/layout/SafeContainer.js
import React from 'react'
import { StyleSheet, StatusBar, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../../utils/constants'

const SafeContainer = ({ 
  children, 
  style, 
  backgroundColor = COLORS.background,
  statusBarStyle = 'dark-content',
  ...props 
}) => {
  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor },
          style
        ]}
        {...props}
      >
        {children}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

export { SafeContainer }