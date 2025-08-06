const { url } = await supabaseHelpers.uploadClubImage(
  clubImage,
  clubId,
  'avatar' // ou 'cover'
)