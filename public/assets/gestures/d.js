import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';
export const dDescription = new GestureDescription('d'); 
dDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
dDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1);
dDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1);
dDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 1);
dDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
dDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1);
dDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
dDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1);
dDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
dDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1);
dDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 1);
export default dDescription;