export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export const getSessionExpiresAt = (user) => Number(user?.sessionExpiresAt || 0);

export const isSessionExpired = (user) => {
  if (!user) return false;
  const expiresAt = getSessionExpiresAt(user);
  return !expiresAt || Date.now() >= expiresAt;
};

export const addSessionExpiry = (nextUser, previousUser) => {
  if (!nextUser) return null;
  const nextUserId = nextUser?._id || nextUser?.id;
  const previousUserId = previousUser?._id || previousUser?.id;
  const previousExpiresAt = getSessionExpiresAt(previousUser);
  const shouldKeepExpiry = nextUserId && previousUserId && String(nextUserId) === String(previousUserId) && previousExpiresAt > Date.now();

  return {
    ...nextUser,
    sessionExpiresAt: nextUser.sessionExpiresAt || (shouldKeepExpiry ? previousExpiresAt : Date.now() + SESSION_DURATION_MS),
  };
};
