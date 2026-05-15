const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const transporter = require("../config/malier");
const axios = require("axios");
const genremap = require("../config/genremap");

async function getMovies() {

    try {

        const [data1, data2, data3, data4, data5] = await Promise.all([

            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 1
                    }
                }
            ),

            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 2
                    }
                }
            ),
            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 1
                    }
                }
            ),

            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 2
                    }
                }
            ),
            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 2
                    }
                }
            )

        ]);

        const allMovies = [
            ...data1.data.results,
            ...data2.data.results
        ];

        return allMovies;

    } catch (err) {

        console.error(
            "TMDB ERROR:",
            err.response?.data || err.message
        );

        return [];
    }
}

function getRecommendedMovies(movies, genreId) {

    let filtered = movies;

    if (genreId) {

        filtered = movies.filter(
            (m) =>
                m.genre_ids &&
                m.genre_ids.includes(genreId)
        );
    }

    if (filtered.length === 0) {
        filtered = movies;
    }

    return filtered
        .sort((a, b) => {

            const scoreA =
                (a.vote_average || 0) * 2 +
                (a.popularity || 0);

            const scoreB =
                (b.vote_average || 0) * 2 +
                (b.popularity || 0);

            return scoreB - scoreA;

        })
        .slice(0, 6);
}

function getRetentionRecommendation(risk, segment) {

    if (risk === "High") {

        if (segment === "Basic Frustrated User") {
            return "Kami memberikan promo spesial dan rekomendasi film terbaik agar pengalaman streaming kamu menjadi lebih menyenangkan.";
        }

        if (segment === "Basic User") {
            return "Nikmati promo spesial dan film populer pilihan khusus untuk kamu.";
        }

        return "Dapatkan loyalty reward dan rekomendasi premium content pilihan.";
    }

    if (risk === "Medium") {

        if (segment === "Basic Frustrated User") {
            return "Kami menyiapkan rekomendasi film baru untuk meningkatkan pengalaman menonton kamu.";
        }

        if (segment === "Basic User") {
            return "Temukan film trending terbaru sesuai genre favorit kamu.";
        }

        return "Nikmati rekomendasi premium content dan personalized movie.";
    }

    return "Terima kasih telah menjadi customer setia kami ❤️";
}

function generateHTML({
    email,
    movies,
    promo_name,
    promo_discount,
    expired_date,
    recommendation,
    genre,
    risk,
    segment
}) {

    return `
    
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">

<style>
    * {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        box-sizing: border-box;
    }
    body {
        margin: 0;
        background-color: #f8fafc;
        color: #111827;
    }
    .container-custom {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px 60px;
    }
</style>

<div class="container-custom">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
            <h1 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Retention Controller</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Analisis dan rekomendasi retensi pelanggan anda.</p>
        </div>
        <a href="/DashboardDetail" style="text-decoration: none; font-size: 13px; font-weight: 700; color: #D82F5A; background: #ffffff; padding: 10px 20px; border-radius: 6px; border: 1px solid #e2e8f0; transition: all 0.2s;">
            ← Back to Dashboard
        </a>
    </div>

    <div style="background: #000000; color: white; padding: 45px 50px; border-radius: 12px; margin-bottom: 40px; position: relative; overflow: hidden; display: flex; align-items: center;">
        <div style="position: relative; z-index: 2; max-width: 600px;">
            <div style="font-size: 11px; font-weight: 700; color: #D82F5A; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Rekomendasi Personal</div>
            <h2 style="font-size: 36px; font-weight: 800; line-height: 1.1; margin: 0 0 16px 0; letter-spacing: -1.5px;">Rekomendasi. <span style="color: #D82F5A;">Pilihan anda.</span></h2>
            <p style="font-size: 15px; color: #94a3b8; margin-bottom: 25px; line-height: 1.6;">${recommendation}</p>
            <button style="background: #D82F5A; color: white; border: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; box-shadow: 0 4px 14px rgba(216,47,90,0.4);">Lanjutkan Menonton</button>
        </div>
        <div style="position: absolute; right: -50px; top: -50px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(216,47,90,0.1) 0%, rgba(216,47,90,0) 70%); border-radius: 50%;"></div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start;">
        
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="font-size: 18px; font-weight: 800; margin: 0;">Koleksi Terpopuler</h3>
                <a href="#" style="color: #D82F5A; font-size: 12px; font-weight: 700; text-decoration: none; text-transform: uppercase;">Lihat Semua →</a>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px;">
                ${movies.map((m) => `
                    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; transition: transform 0.2s;">
                        <div style="height: 280px; position: relative; background: #f1f5f9;">
                            <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 12px; right: 12px; background: rgba(17,24,39,0.85); color: #fbbf24; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px;">
                                <i class="ti ti-star-filled"></i> ${m.vote_average}
                            </div>
                        </div>
                        <div style="padding: 18px; background: white;">
                            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.title}</div>
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 16px;">2024 • Film Pilihan</div>
                            <a href="https://www.themoviedb.org/movie/${m.id}" style="color: #D82F5A; text-decoration: none; font-size: 12px; font-weight: 800; text-transform: uppercase;">Lihat Detail</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="position: sticky; top: 40px;">
            <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
                <div style="background: #fff1f2; color: #D82F5A; padding: 6px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; display: inline-block; margin-bottom: 20px; text-transform: uppercase;">${promo_name}</div>
                <h4 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.3;">Upgrade pengalaman anda.</h4>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 25px;">Nikmati penawaran khusus untuk langganan berikutnya sebelum masa berlaku habis.</p>
                
                <div style="text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 25px;">
                    <div style="font-size: 64px; font-weight: 900; color: #111827; letter-spacing: -3px; line-height: 1;">${promo_discount}<span style="font-size: 24px;">%</span></div>
                    <div style="font-size: 11px; font-weight: 800; color: #D82F5A; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">Voucher Diskon</div>
                    <div style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Berlaku sampai: <br><b style="color: #111827;">${expired_date}</b></div>
                </div>
                
                <button style="width: 100%; margin-top: 25px; background: #111827; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer;">Klaim Sekarang</button>
            </div>
        </div>
    </div>
</div>

<footer style="background: #ffffff; border-top: 1px solid #f1f5f9; padding: 60px 60px 0 60px; margin-top: 80px;">
    <div style="max-width: 1400px; mx-auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; border-bottom: 1px solid #f1f5f9; pb: 40px; margin-bottom: 0;">
        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">ChurnGuard <span style="color: #D82F5A;">CRM</span></h3>
            <p style="color: #616161; font-size: 12px; line-height: 1.6; max-width: 250px; margin-bottom: 20px;">Solusi cerdas menjaga loyalitas dan memperkuat hubungan pelanggan Anda secara berkelanjutan.</p>
            <div style="display: flex; gap: 12px;">
                <div style="width: 32px; height: 32px; border: 1px solid rgba(216,47,90,0.2); rounded: 4px; display: flex; align-items: center; justify-content: center; color: #D82F5A; border-radius: 4px;"><i class="ti ti-brand-instagram"></i></div>
                <div style="width: 32px; height: 32px; border: 1px solid rgba(216,47,90,0.2); rounded: 4px; display: flex; align-items: center; justify-content: center; color: #D82F5A; border-radius: 4px;"><i class="ti ti-brand-x"></i></div>
                <div style="width: 32px; height: 32px; border: 1px solid rgba(216,47,90,0.2); rounded: 4px; display: flex; align-items: center; justify-content: center; color: #D82F5A; border-radius: 4px;"><i class="ti ti-brand-youtube"></i></div>
            </div>
        </div>
        <div>
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="ti ti-map-pin" style="color: #D82F5A;"></i> Alamat</h4>
            <p style="color: #616161; font-size: 12px; line-height: 1.6;">Gedung Perpustakaan PNJ, Beji, Depok, Jawa Barat 16425.</p>
        </div>
        <div>
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="ti ti-phone" style="color: #D82F5A;"></i> No. Telepon</h4>
            <p style="color: #616161; font-size: 12px;">+62 21 727 0036</p>
        </div>
        <div>
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="ti ti-mail" style="color: #D82F5A;"></i> Email</h4>
            <p style="color: #616161; font-size: 12px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer;">petisatukan@pnj.ac.id</p>
        </div>
    </div>
    <div style="background: #000000; margin: 30px -60px 0 -60px; padding: 20px 0;">
        <p style="text-align: center; color: white; font-size: 11px; opacity: 0.7; margin: 0;">© 2026 CHURNGUARD CRM. Hak Cipta Dilindungi Undang-Undang.</p>
    </div>
</footer>
    `;
}


exports.getGeneratedEmail = async (req, res) => {

    try {

        const {
            promo_name,
            promo_discount,
            expired_date,
            risk,
            segment,
            genre,
            email
        } = req.body;

        const genreId =
            genremap[
            genre?.toLowerCase()?.replace(/\s/g, "_")
            ];

        const movies = await getMovies();

        const recommendedMovies =
            getRecommendedMovies(
                movies,
                genreId
            );

        const recommendation =
            getRetentionRecommendation(
                risk,
                segment
            );

        const html = generateHTML({
            email,
            movies: recommendedMovies,
            promo_name,
            promo_discount,
            expired_date,
            recommendation,
            genre,
            risk,
            segment
        });

        return res.status(200).json({
            success: true,
            html
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Failed generate retention email"
        });
    }
};

exports.sendEmail = async (req, res) => {

    const {
        email: customerEmail,
        html,
        id
    } = req.body;

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                message: "No token provided"
            });

        }

        const token =
            authHeader.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const userEmail =
            decoded.email;

        // SEND EMAIL
        const info =
            await transporter.sendMail({

                from:
                    '"ChurnGuard CRM"',

                to:
                    customerEmail,

                subject:
                    "🎬 Rekomendasi Spesial Untuk Kamu!",

                html:
                    html

            });

        // AMBIL PREDICTION ACTIVE
        const [predid] =
            await churnguard_con.query(
                `
                SELECT prediction_id
                FROM prediction_list
                WHERE user_email = ?
                AND status = "active"
                `,
                [userEmail]
            );

        if (predid.length === 0) {

            return res.status(404).json({
                message:
                    "Prediction tidak ditemukan"
            });

        }

        // UPDATE EMAIL SENT
        await churnguard_con.query(
            `
            UPDATE prediction_detail
            SET email_sent = ?
            WHERE prediction_id = ?
            AND CustomerID = ?
            `,
            [
                html,
                predid[0].prediction_id,
                id
            ]
        );

        return res.status(200).json({

            success: true,

            message:
                "Email berhasil dikirim",

            messageId:
                info.messageId

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

};

async function sendRetentionEmail({
    customer,
    promo_name,
    promo_discount,
    expired_date,
    risk,
    segment,
    prediction_id
}) {
    try {

        const genreId =
            genremap[
            customer.GenrePreference
                ?.toLowerCase()
                ?.replace(/\s/g, "_")
            ];

        const movies = await getMovies();

        const recommendedMovies =
            getRecommendedMovies(
                movies,
                genreId
            );

        const recommendation =
            getRetentionRecommendation(
                risk,
                segment
            );

        const html = generateHTML({
            email: customer.email,
            movies: recommendedMovies,
            promo_name,
            promo_discount,
            expired_date,
            recommendation,
            genre: customer.GenrePreference,
            risk,
            segment
        });

        await transporter.sendMail({
            from: '"ChurnGuard"',
            to: customer.email,
            subject: "🎬 Rekomendasi Spesial Untuk Kamu!",
            html
        });


        await churnguard_con.query(
            `UPDATE prediction_detail
             SET email_sent = ?,
                 email_sent_at = NOW()
             WHERE email = ?
             AND prediction_id = ?
             AND CustomerID = ?`,
            [
                html,
                customer.email,
                prediction_id,
                customer.CustomerID
            ]
        );

    } catch (err) {
        console.error("sendRetentionEmail error:", err.message);
    }
}

exports.bulkSend = async (req, res) => {
    const {
        promo_ALL_R_H_S,
        promo_ALL_R_H_S_value,
        promo_ALL_R_H_S_expired,

        promo_H_M_R_L_S,
        promo_H_M_R_L_S_value,
        promo_H_M_R_L_S_expired,

        promo_M_H_R_M_S,
        promo_M_H_R_M_S_value,
        promo_M_H_R_M_S_expired,

        promo_L_R_M_L_S,
        promo_L_R_M_L_S_value,
        promo_L_R_M_L_S_expired
    } = req.body;
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const promoList = [

            {
                name: promo_ALL_R_H_S,
                value: promo_ALL_R_H_S_value,
                expired: promo_ALL_R_H_S_expired,
                risk: "High-Medium-Low",
                segment: "Basic Frustrated user"
            },

            {
                name: promo_H_M_R_L_S,
                value: promo_H_M_R_L_S_value,
                expired: promo_H_M_R_L_S_expired,
                risk: "High-Medium",
                segment: "Experienced user"
            },

            {
                name: promo_M_H_R_M_S,
                value: promo_M_H_R_M_S_value,
                expired: promo_M_H_R_M_S_expired,
                risk: "Medium-High",
                segment: "Basic user"
            },

            {
                name: promo_L_R_M_L_S,
                value: promo_L_R_M_L_S_value,
                expired: promo_L_R_M_L_S_expired,
                risk: "Low",
                segment: "Basic user-Experienced user"
            }

        ];

        const [rows] = await churnguard_con.query(
            `SELECT prediction_id 
             FROM prediction_list 
             WHERE user_email = ?
             AND status = "active"`
            ,
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "Prediction ID not found"
            });
        }

        const prediction_id = rows[0].prediction_id;

        for (const promo of promoList) {

            if (!promo.name) continue;

            console.log("Processing promo:", promo.name);

            const [customerRows] = await churnguard_con.query(
                `SELECT email, GenrePreference, CustomerID
                 FROM prediction_detail
                 WHERE Risk IN ("Low", "Medium", "High")
                 AND Segment = ?
                 AND email_sent IS NULL
                 AND email_sent_at IS NULL
                 AND prediction_id = ?`,
                [
                    promo.segment,
                    prediction_id
                ]
            );
            console.log(`Found customers for ${promo.name}:`, customerRows.length);
            console.log(prediction_id)

            if (!customerRows || customerRows.length === 0) {
                continue;
            }
            for (const customer of customerRows) {

                try {
                    console.log("Sending email to:", customer.email);

                    await sendRetentionEmail({
                        customer,
                        promo_name: promo.name,
                        promo_discount: promo.value,
                        expired_date: promo.expired,
                        risk: promo.risk,
                        segment: promo.segment,
                        prediction_id
                    });

                } catch (emailErr) {
                    console.error("Email failed for:", customer.email, emailErr.message);
                }
            }
        }

        return res.status(200).json({
            message: "Bulk email trigger finished"
        });

    } catch (err) {
        console.error("bulkSend error:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getEmailSent = async (req, res) => {

}