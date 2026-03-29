-- ربط المستثمر (user) بقطاعات الاستثمار — علاقة many-to-many
-- نفّذ هذه الأوامر يدوياً على MySQL (لا تُطبَّق تلقائياً من التطبيق)

-- 1) جدول القطاعات
CREATE TABLE `InvestmentSector` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `InvestmentSector_key_key` (`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) جدول الربط: مستثمر واحد يمكن أن يكون في أكثر من قطاع
CREATE TABLE `UserInvestmentSector` (
    `userId` INT NOT NULL,
    `sectorId` INT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserInvestmentSector_sectorId_idx` (`sectorId`),
    PRIMARY KEY (`userId`, `sectorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3) المفاتيح الأجنبية
ALTER TABLE `UserInvestmentSector`
    ADD CONSTRAINT `UserInvestmentSector_userId_fkey`
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `UserInvestmentSector_sectorId_fkey`
        FOREIGN KEY (`sectorId`) REFERENCES `InvestmentSector` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) (اختياري) بذور أولية للقطاعات — عدّل أو احذف حسب احتياجك
INSERT INTO `InvestmentSector` (`key`, `nameAr`, `createdAt`, `updatedAt`) VALUES
    ('cars', 'صندوق تأجير السيارات', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('recruitment', 'صندوق التوظيف', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('hospitality', 'صندوق الضيافة', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- مثال: ربط مستثمر userId = 1 بقطاعي cars و hospitality
-- INSERT INTO `UserInvestmentSector` (`userId`, `sectorId`, `createdAt`) VALUES
--     (1, (SELECT id FROM `InvestmentSector` WHERE `key` = 'cars' LIMIT 1), CURRENT_TIMESTAMP(3)),
--     (1, (SELECT id FROM `InvestmentSector` WHERE `key` = 'hospitality' LIMIT 1), CURRENT_TIMESTAMP(3));
