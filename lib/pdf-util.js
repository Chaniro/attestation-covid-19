import { generateQR } from './util'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const ys = {
    travail: 551,
    achats: 481,
    sante: 432,
    famille: 408,
    handicap: 372,
    sport_animaux: 348,
    convocation: 275,
    missions: 250,
    enfants: 225,
}

export async function generatePdf (profile, creationInstant, reasons, pdfBase) {
    const creationDate = creationInstant.toLocaleDateString('fr-FR')
    const creationHour = creationInstant
        .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        .replace(':', 'h')

    const {
        lastname,
        firstname,
        birthday,
        placeofbirth,
        address,
        zipcode,
        city,
        datesortie,
        heuresortie,
    } = profile

    const data = [
        `Cree le: ${creationDate} a ${creationHour}`,
        `Nom: ${lastname}`,
        `Prenom: ${firstname}`,
        `Naissance: ${birthday} a ${placeofbirth}`,
        `Adresse: ${address} ${zipcode} ${city}`,
        `Sortie: ${datesortie} a ${heuresortie}`,
        `Motifs: ${reasons}`,
    ].join(';\n ')

    const existingPdfBytes = await fetch(pdfBase).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // set pdf metadata
    pdfDoc.setTitle('COVID-19 - Déclaration de déplacement')
    pdfDoc.setSubject('Attestation de déplacement dérogatoire')
    pdfDoc.setKeywords([
        'covid19',
        'covid-19',
        'attestation',
        'déclaration',
        'déplacement',
        'officielle',
        'gouvernement',
    ])
    pdfDoc.setProducer('DNUM/SDIT')
    pdfDoc.setCreator('')
    pdfDoc.setAuthor("Ministère de l'intérieur")

    const page1 = pdfDoc.getPages()[0]

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawText = (text, x, y, size = 11) => {
        page1.drawText(text, { x, y, size, font })
    }

    drawText(`${firstname} ${lastname}`, 100, 702)
    drawText(birthday, 100, 684)
    drawText(placeofbirth, 230, 684)
    drawText(`${address} ${zipcode} ${city}`, 113, 666)

    reasons
        .split(', ')
        .forEach(reason => {
            drawText('x', 45, ys[reason], 18)
        })

    let locationSize = getIdealFontSize(font, profile.city, 83, 7, 11)

    if (!locationSize) {
        alert(
            'Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
            'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.',
        )
        locationSize = 7
    }

    drawText(profile.city, 85, 76, locationSize)
    drawText(`${profile.datesortie}`, 71, 58, 11)
    drawText(`${profile.heuresortie}`, 234, 58, 11)

    // const shortCreationDate = `${creationDate.split('/')[0]}/${
    //   creationDate.split('/')[1]
    // }`
    // drawText(shortCreationDate, 314, 189, locationSize)

    // // Date création
    // drawText('Date de création:', 479, 130, 6)
    // drawText(`${creationDate} à ${creationHour}`, 470, 124, 6)

    const generatedQR = await generateQR(data)

    const qrImage = await pdfDoc.embedPng(generatedQR)

    page1.drawImage(qrImage, {
        x: page1.getWidth() - 156,
        y: 100,
        width: 92,
        height: 92,
    })

    pdfDoc.addPage()
    const page2 = pdfDoc.getPages()[1]
    page2.drawImage(qrImage, {
        x: 50,
        y: page2.getHeight() - 350,
        width: 300,
        height: 300,
    })

    const pdfBytes = await pdfDoc.save()

    return new Blob([pdfBytes], { type: 'application/pdf' })
}

function getIdealFontSize (font, text, maxWidth, minSize, defaultSize) {
    let currentSize = defaultSize
    let textWidth = font.widthOfTextAtSize(text, defaultSize)

    while (textWidth > maxWidth && currentSize > minSize) {
        textWidth = font.widthOfTextAtSize(text, --currentSize)
    }

    return textWidth > maxWidth ? null : currentSize
}