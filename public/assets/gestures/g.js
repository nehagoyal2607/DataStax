import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';
export const gDescription = new GestureDescription('g'); 
gDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1);
gDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1);
gDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1);
gDescription.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1);
gDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
gDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 1);
gDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
gDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 1);
gDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
gDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 1);
gDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1);
gDescription.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1);
gDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 1);
gDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft, 1);
gDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1);
export default gDescription;