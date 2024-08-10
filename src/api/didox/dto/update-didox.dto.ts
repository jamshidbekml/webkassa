import { PartialType } from '@nestjs/swagger';
import { CreateDidoxDto } from './create-didox.dto';

export class UpdateDidoxDto extends PartialType(CreateDidoxDto) {}
