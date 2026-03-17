-- إنشاء جدول OTP للتحقق عند تسجيل الدخول
-- لا تُطَبَّق تلقائياً — نفّذها يدوياً على الداتا بيس

CREATE TABLE `OtpVerification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nationalId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OtpVerification_nationalId_phoneNumber_idx`(`nationalId`, `phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
