import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';


// describe victory gesture ✌️
export const aDescription = new GestureDescription('a'); 


// thumb:
aDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
aDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);
aDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);

// index:
aDescription.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1.0);
aDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);
// middle:
aDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 1.0);
aDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.25);
aDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 1.0);

// ring:
aDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 0.07142857142857142);
aDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
aDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft,0.07142857142857142);


// pinky:
aDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aDescription.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);


export default aDescription;
