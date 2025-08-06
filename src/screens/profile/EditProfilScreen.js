const handleAvatarUpload = async (imageFile) => {
  try {
    const { url } = await supabaseHelpers.uploadAvatar(imageFile, user.id)
    await updateProfile({ avatar_url: url })
  } catch (error) {
    console.error('Erreur avatar:', error)
  }
}