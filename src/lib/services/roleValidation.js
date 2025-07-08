/**
 * Memvalidasi sesi dan peran pengguna. 
 * Akan melempar (throw) error jika validasi gagal.
 * @param {object} session - Objek sesi pengguna.
 * @param {string} requiredRole - Peran yang dibutuhkan (default: 'admin').
 * @throws {Error} Melempar error dengan properti 'status' (401 atau 403).
 */
export const authorizeRole = (session, requiredRole = 'admin') => {
    if (!session) {
        const error = new Error('Unauthorized: No session provided.');
        error.status = 401;
        throw error;
    }
    
    // Menggunakan optional chaining untuk keamanan
    if (session?.user?.role !== requiredRole) {
        const error = new Error(`Forbidden: This action requires the '${requiredRole}' role.`);
        error.status = 403;
        throw error;
    }
    return {
        success: true,
        status: 400,
        messages: "Authorization Success"
    }
}