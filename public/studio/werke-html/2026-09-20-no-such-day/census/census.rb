# Four readers from one class. Ruby's Date takes a calendar-reform date as an
# argument; ITALY (1582-10-15) is the one you get when you do not pass one.
require 'date'
Y0, Y1 = 1500, 1930
out = ARGV[0]
{ 'ruby-default-italy' => Date::ITALY, 'ruby-england' => Date::ENGLAND,
  'ruby-julian' => Date::JULIAN, 'ruby-gregorian' => Date::GREGORIAN }.each do |name, start|
  File.open(File.join(out, name + '.txt'), 'w') do |f|
    (Y0..Y1).each do |y|
      (1..12).each do |m|
        (1..31).each do |d|
          begin
            f.puts Date.new(y, m, d, start).jd
          rescue Date::Error, ArgumentError
            f.puts '-'
          end
        end
      end
    end
  end
end
STDERR.puts "ruby #{RUBY_VERSION}"
