import {theme} from './theme';
import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('screen');

const scale = size => width * (size / 375);
const verticalScale = size => height * (size / 812);
const moderateScale = (size, factor = 0) =>
  size + (scale(size) - size) * factor;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textPrimary: {
    color: theme.colors.primary,
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textSecondary: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textTertiary: {
    color: theme.colors.tertiary,
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textWhite: {
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textBlack: {
    color: theme.colors.dark,
    fontFamily: theme.typography.roboto.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textError: {
    color: theme.colors.error,
    fontFamily: theme.typography.roboto.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    left: width * 0.014,
  },

  textSuccess: {
    color: theme.colors.success,
    fontFamily: theme.typography.roboto.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    left: width * 0.014,
  },

  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: verticalScale(theme.spacing(1.8)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    minWidth: width * 0.4,
  },

  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: verticalScale(theme.spacing(2)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    minWidth: width * 0.4,
    minHeight: height * 0.06,
  },

  buttonTextPrimary: {
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
  },

  buttonTextSecondary: {
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
  },

  inputContainer: {
    marginVertical: verticalScale(theme.spacing(1.5)),
  },

  input: {
    backgroundColor: theme.colors.white,
    borderWidth: moderateScale(2),
    borderColor: theme.colors.primary,
    borderRadius: moderateScale(theme.borderRadius.large),
    paddingVertical: verticalScale(theme.spacing(1.6)),
    paddingHorizontal: scale(theme.spacing(4)),
    fontSize: moderateScale(theme.typography.fontSize.md),
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.dark,
    minHeight: height * 0.068,
  },

  inputLabel: {
    fontFamily: theme.typography.roboto.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    left: width * 0.014,
    color: theme.colors.dark,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(theme.borderRadius.medium),
    padding: moderateScale(theme.spacing(2)),
    gap: verticalScale(theme.gap(1)),
    ...theme.elevation.depth2,
    minWidth: width * 0.9,
  },

  cardTitle: {
    fontFamily: theme.typography.roboto.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.md),
    color: theme.colors.dark,
    marginBottom: verticalScale(theme.spacing(1)),
  },

  cardContent: {
    fontFamily: theme.typography.roboto.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
    color: theme.colors.secondary,
    lineHeight: moderateScale(theme.typography.lineHeight.sm),
  },

  divider: {
    height: verticalScale(1),
    backgroundColor: theme.colors.gray,
    marginVertical: verticalScale(theme.spacing(1)),
  },
});
